---
layout: post
title: How I built my first CTF Challenge
date: 2020-07-20 01:00 +0700
modified: 2020-07-20 01:00 +0700
description: How I built my first CTF Challenge
tag:
  - CTF
image: /creating-stranger-servers/stranger-servers-ctf.png
author: Tyler Butler
summary: How I built my first CTF Challenge
comments: true
tweet: true
---
> How I built my first CTF Challenge

<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="stranger-servers-ctf.png">
    </div>
</div>
<br/>  



## Overview

**Stranger Servers** is the first CTF Challenge I've created. The basic web challenge consists of a 90's themed website with a hidden vulnerable php application. The inspiration for backend comes from an old php application called timeclock which  has several reported vulnerabilities [(See Employee TimeClock Software 0.99 - SQL Injection)](https://www.exploit-db.com/exploits/39427)     

The main challenge website is hosted on an apache webserver on a basic tier server from digital ocean. This is not the cheapest way to host a challenge, however, I chose this design because I was already using the server as a testing ground for vulnerability research into the timeclock application. 

<div class="alert alert-danger alert-dismissible fade show" role="alert" >
  <strong class="text-dark">Before you Read!</strong> This article will contain spoilers, if you want to solve this challenge, have a go before reading.
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>     

<a href="https://0x90skids.com/ctf/"><button type="button" class="btn btn-dark">Go to Challenge</button>
</a> 


## Index
- [Overview](#overview)
- [Index](#index)
- [Seting up](#seting-up)
  - [Infrastructure](#infrastructure)
    - [Spinning up a Digital Ocean Droplet](#spinning-up-a-digital-ocean-droplet)
    - [Ubunto Server Configuration](#ubunto-server-configuration)
  - [Back-end](#back-end)
    - [Configuring Vulnerable Timeclock App](#configuring-vulnerable-timeclock-app)
    - [Creating a MySQL Database](#creating-a-mysql-database)
    - [Connecting MySQL to Timeclock App](#connecting-mysql-to-timeclock-app)
  - [Front-End](#front-end)
    - [Website Generation](#website-generation)

## Seting up 

### Infrastructure

#### Spinning up a Digital Ocean Droplet

1) First, I created a digital [ocean account ](https://www.digitalocean.com/)      
  
2) Next, I created an ubunto droplet with a basic plan. I chose the lowest possible tier, which, for $5 a month gets you 1 GB / 1 CPU, 25 GB SSD disk, 1000 GB transfer. This will be much more then I need for the challenge, and will allow me to host other challenges on the same droplet,

<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="stranger-servers-1.png">
    </div>
</div>
<br/>  

3) I selected a data center region to host the droplet, and finally created SSH credentials to enable remote log in

#### Ubunto Server Configuration  

After the server booted up, I logged into it with SSH and started some initial configuration   

1)  First, I ran the usual update commands to ensure I was using the latest packages 

```bash
apt-get update && apt-get upgrade
```

2) I install [Hugo](https://gohugo.io/), a static web generator to quickly create websites from templates. I used snap for installation

```bash
snap install hugo --channel=extended
``` 

### Back-end

#### Configuring Vulnerable Timeclock App  
*Now for the fun stuff.*

The idea for this CTF was to use the [timeclock](http://timeclock-software.net/) application as a basic SQLinjectible form. Timeclock is a basic php app which enables employers to track empolyee working time through an apache,php,mysql website. Older versions of the app are vulnerable to a host of exploits, including three on the exploit-db database. These include exploits like as [Employee TimeClock Software 0.99 - SQL Injection](https://www.exploit-db.com/exploits/39427), [TimeClock Software 0.995 - Multiple SQL Injections](https://www.exploit-db.com/exploits/39404), and [TimeClock 0.99 - Cross-Site Request Forgery (Add Admin)](https://www.exploit-db.com/exploits/11516).  

<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="exploit-db.png">
    </div>
</div>
<br/>  

Each of these exploits were for older versions of timeclock. I was unable to find these particular versions, so I settled on removing the security patches from the latest version 1.01.  

I downloaded the latest version from the vendor portal at http://timeclock-software.net/timeclock-download.php. I unzipped the download package and using SCP I transfered the entire application to my digital ocean server.  

```bash 
scp /path/to/timeclock user@[ip address of server]:/path/to/destination
```  

#### Creating a MySQL Database   
Timeclock uses a mysql database to store user information such as username and passwords as well as time entry and pay rate. The app download includes a .sql file to automatically create the database. I used the following commands to set it up.  

Log in and create empty database
```bash
mysql -u root -p    

mysql> CREATE DATABASE timeclock;
``` 

Log out, and modify database with .sql file   
```bash
mysql -u root -p timeclock > timeclock.sql
```  

#### Connecting MySQL to Timeclock App     

The only setup step required for the timeclock app is to change the default configuration in the db.php file to use the correct mysql options.  

```php 
<?php
// You need to change these to your settings.

/** the name of the database */
$db_name = "xxx";

/** mysql database username */
$db_user = "xxx";

/** mysql database password */
$db_password = "xxx";

/** mysql hostname */
$db_host = "xxx";
```  

To test if the application works, I moved it to the /var/www/html directory and started the apache webserver.   

```bash
cp /timeclock /var/www/html
service apache2 start 
```

### Front-End  

#### Website Generation    
To quickly create a fun front-end for the challenge. I searched through the hugo themes until I found a retro 90s theme from cshoredaniel called [new-oldnew-mashup](https://github.com/cshoredaniel/new-oldnew-mashup).   

I mostly followed a fantastic article from Justin Ellingwood on the digital ocean website, ["How To Install and Use Hugo, a Static Site Generator, on Ubuntu 14.04"](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-hugo-a-static-site-generator-on-ubuntu-14-04) for setup instructions, generating the site with the following.

``` bash
hugo new site ~/Hawkins-Library
cd ~/Hawkins-Library
```

I edited the config file to the followig 

```html 
baseurl = "http://public.ip.address"
languageCode = "en-us"
title = "Hawkins Public Library"
theme = "new-oldnew-mashup"
```  

Last, I created new pages for the site, including the books, news, study groups, and home pages. 

```bash
hugo new book.md
```  


