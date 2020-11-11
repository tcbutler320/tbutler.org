---
layout: post
title: Creating my first CTF Challenge
description: Using Digial Ocean, Hugo, and a LAMP stack to host a Capture the Flag Challenge
tag: ctf
image: /assets/img/posts/2020-07-17-creating-stranger-servers-ctf/stranger-servers-ctf.png
layout: post
date:   2020-10-29 20:01:21 -0400
last-updated: 2020-10-26 20:01:21 -0400
author: Tyler Butler
---
>  Using Digial Ocean, Hugo, and a LAMP stack to host a Capture the Flag Challenge

## Overview

**Stranger Servers** is the first CTF Challenge I've created. The basic web challenge consists of a 90's themed website with a hidden vulnerable php application. The inspiration for the backend comes from an older php application called timeclock which has several reported vulnerabilities [(See Employee TimeClock Software 0.99 - SQL Injection)](https://www.exploit-db.com/exploits/39427)     

The main challenge website is hosted on an apache webserver on a basic tier droplet from digital ocean. This is not the cheapest way to host a challenge, however, I chose this design because I was already using the server as a testing ground for vulnerability research into the timeclock application. 

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
    - [Flag Layout](#flag-layout)
    - [Making the App Vulnerable](#making-the-app-vulnerable)
  - [Front-End](#front-end)
    - [Website Generation](#website-generation)
- [Conclusion](#conclusion)

## Seting up 

### Infrastructure

#### Spinning up a Digital Ocean Droplet

1) First, I created a digital [ocean account ](https://www.digitalocean.com/)      
  
2) Next, I created an ubunto droplet with a basic plan. I chose the lowest possible tier, which, for $5 a month gets you 1 GB / 1 CPU, 25 GB SSD disk, 1000 GB transfer. This will be much more then I need for the challenge, and will allow me to host other challenges on the same droplet,

<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2020-07-17-creating-stranger-servers-ctf/stranger-servers-1.png">
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

The idea for this CTF was to use the [timeclock](http://timeclock-software.net/) application as a basic SQLinjectible form. Timeclock is a basic php app which enables employers to track empolyee working time through an apache, php, and mysql website. Older versions of the app are vulnerable to a host of exploits, including three on the exploit-db database. These include exploits like as [Employee TimeClock Software 0.99 - SQL Injection](https://www.exploit-db.com/exploits/39427), [TimeClock Software 0.995 - Multiple SQL Injections](https://www.exploit-db.com/exploits/39404), and [TimeClock 0.99 - Cross-Site Request Forgery (Add Admin)](https://www.exploit-db.com/exploits/11516).  

<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2020-07-17-creating-stranger-servers-ctf/exploit-db.png">
    </div>
</div>
<br/>  

Each of these exploits were for older versions of timeclock. Since I was unable to find these particular versions, I settled on removing the security patches from the latest version 1.01.  

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

#### Flag Layout  

The plan for the CTF was to have 3 flags at varying levels of difficulty. Each flag would provide hints to the next, with the first flag being found through common directory scanning or a hint in the challenge description. The flags are structured like this.  

1.  Beginner Flag: Located at robots.txt
2.  Intermediate Flag: Available through a simple SQL injection in the login-in field of the hidden timeclock application  
3.  Intermediate-Advanced Flag: Available through either a time-based SQLinjection in the add_time form, or alternatively available through a modified SQLinjection of the second flag in the log-in field.  

#### Making the App Vulnerable    

According to some basic research, the timeclock 1.01 application is not vulnerable to any known exploits, however, older versions are. Looking at the exploit-db records for timeclock, I noticed there was a SQLinjection on the log-in form in version .99. It appears as if there was not any proper sanitization of user input in this field, leading to this exploit.     

While I could not be certain, taking a look at the source code 1.01, it appears the developers added the cclean and dclean functions to sanitize inputs.   

```php
function dclean($data) {
	if ( !is_numeric ($data) ) {
		echo "Invalid Data";
		exit;
	}
	$data = htmlspecialchars($data, ENT_QUOTES);
return $data;
}

function cclean($data) {
	$data = htmlspecialchars($data, ENT_QUOTES);
return $data;
}
```  

Removing the references to these functions, would remove any user input sanitization. The SQLi on the log-in form still would not work until I removed the password_verify function in the login_action.php file. 

*Original Timeclock Application*
```php
if (password_verify($timeapp_password, $password)) {
	//echo "<p>Success!</p>";
	$_SESSION['timeapp_id'] 		= $row["user_id"];
	$_SESSION['timeapp_level']		= $row["level"];
	$_SESSION["timeapp_username"]	= $row["username"];
	header ("Location: index.php?success");
	
}else {
	//echo "<p>Failure</p>";
	unset($_SESSION['timeapp_username']);
	unset($_SESSION['timeapp_password']);
	unset($_SESSION['timeapp_level']);
	$_SESSION = array();
	session_destroy();
	header ("Location: login.php?error2");
	exit;
}
```  

With the p

*New CTF Application*
```php
if ($result->num_rows > 0) {
   	$_SESSION['timeapp_id']                 = $row["user_id"];
        $_SESSION['timeapp_level']              = $row["level"];
        $_SESSION["timeapp_username"]   = $row["username"];
        header ("Location: index.php?timeapp_password:$timeapp_password:passcode:$passcode");
    } else {
      unset($_SESSION['timeapp_username']);
      unset($_SESSION['timeapp_password']);
      unset($_SESSION['timeapp_level']);
      $_SESSION = array();
      session_destroy();
      header ("Location: login.php?better_luck_next_time:$sql");
      exit;
}
```  

With the ```password_verify``` function gone, any SQLi that returns a valid user can log into the app as that user. 

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

When I was finished designing the front end for the challenge. I copied the generated static site into the apache web directory, restarted apache, and the challenge was live.  

<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2020-07-17-creating-stranger-servers-ctf/hawkins-lab.png">
    </div>
</div>  


## Conclusion

Overall it was a good learning experience to design, create, and host my own capture the flag challenge. In the future, I will plan on dockerizing this challenge for easier portabiliy and allow others to host the challenge locally instead of on a remote server.   





