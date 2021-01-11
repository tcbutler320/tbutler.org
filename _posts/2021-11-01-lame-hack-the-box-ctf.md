---
title: Lame, Hack the Box CTF Walkthrough
description: Lame, Hack the Box CTF Walkthrough
tag: CTF
image: /assets/img/posts/2020-01-11-lame-hack-the-box-walkthrough/lame.png
layout: post
description: "Lame, Hack the Box CTF Walkthrough"
date:   2021-01-10 20:01:21 -0400
last-updated: 2021-01-10 20:01:21 -0400
tag: ctf
author: Tyler Butler
---

```bash
┌──(kali㉿kali)-[~/Documents/htb/legacy]
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

```javascript
<script>
    function displayPigLatin(){
        var input = "input";
        var output = "output";
        document.getElementById(output).innerHTML = encode(input,output);
    }
</script>
```