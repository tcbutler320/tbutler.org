---
title: PHP TimeClock 1.04 SQLi/XSS Disclosure
description: A Deep Dive into Vulnerability Research with Docker and BurpSuite
featured: true
feature-header: "Featured Research \U0001F447"
tag: Vulnerability Research
image: "/assets/img/posts/2021-05-13-PHP-TimeClock-0-Day-Disclosure/preview.jpg"
layout: post
date: '2021-05-13 00:01:21 -0400'
last-updated: '2021-05-13 00:01:21 -0400'
style: blog1
author: Tyler Butler
lead: A Deep Dive into Vulnerability Research with Docker and BurpSuite
card: card-2
postid: 1
redirect_from:
- "/php-timeclock"
- "/timeclock"
navheader: posts
---

<p><small><i>preview image courtesy of <a class="highlighted" href="https://unsplash.com/@kobuagency">@kobuagency</a></i></small></p>

<div class="alert alert-info" role="alert">
  <i class="fa fa-info-circle" aria-hidden="true"></i> 
   If you want to skip to the good stuff and just see the "what vuln, where, and how" section, go <a href="{{page.url}}/#web-application-testing-with-burpsuite">here</a>
</div>

Last week, I discovered multiple vulnerabilities effecting a legacy time management application called <a href="http://timeclock.sourceforge.net/" class="highlighted">PHP Timeclock</a>. Originally developed and released in 2006, the application uses deprecated versions of PHP and MySQL. While official support for the project stopped in late 2013, I found evidence that several major organizations were still using the product. In this article, I'll describe how I used docker to create a test environment for vulnerability research, and how I used BurpSuite to discover cross-site scripting and sql injection vulnerabilities.

*Edit 5/13: I've since learned some of these vulns were disclosed in 2015 on <a href="https://cxsecurity.com/issue/WLB-2016010155" class="highlighted">cxsecurity</a> but never made it to exploit-db, kudos to the original researcher [@Blast3r_ma](https://twitter.com/Blast3r_ma)* 

####  **Index**  
- [Preface]({{page.url}}/#preface)
  - [Getting a Hunch]({{page.url}}/#getting-a-hunch)
  - [Developing a Testing Methodology]({{page.url}}/#developing-a-testing-methodology)
- [Docker for Security Research]({{page.url}}/#docker)
  - [Dockerizing PHP Timeclock]({{page.url}}/#dockerizing-php-timeclock)
- [Web Application Testing with BurpSuite]({{page.url}}#web-application-testing-with-burpsuite)
  - [1: Automated Scanning]({{page.url}}/#1-automated-scanning)
  - [2: Manual Injection Testing]({{page.url}}/#2-manual-injection-testing)
    - [XSS]({{page.url}}#xss)
    - [SQLi]({{page.url}}#sqli)
  - [3: Static Code Analysis]({{page.url}}#2-static-code-analysis)



####  **Preface**  
I originally found out about PHP Timeclock from some research I did awhile back on a similar application called "TimeClock Software". In late 2019  I was practicing in the offsec labs for the OSCP course when I found a sql injection vulnerability on a box running TimeClock. I thought this was just a part of the labs until I looked up the version on Exploit-DB. There were indeed SQL injection PoC's for <a href="https://www.exploit-db.com/exploits/39404" class="highlighted">versions prior</a>, but not the version running in the lab. 

This got me excited as I thought I discovered my first 0-day. I downloaded the most up to date version of TimeClock from sourceforge, and dockerized the application to test locally. Long story short, the most up to date version was NOT vulnerable, and the offsec folks must have modded their box to make it so.   

My dockerized application did not go to waste, as I decided to turn it into a fun <a href="https://0x90skids.com/ctf/" class="highlighted">Stranger Things Themed CTF challenge</a>. I've since decommissioned the server that it runs on, but if you're intersted in playing it let me know on twitter [@tbutler0x90](https://twitter.com/tbutler0x90)! Its loosely based on Stranger Things and features early 90's cold-war era goodness 😏. 

<div class="row">
    <div class="mx-auto">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-13-PHP-TimeClock-0-Day-Disclosure/stranger-servers.png" alt="" title="My Custom CTF Challenge"/>
    </div>
</div>  

<br>

I released the CTF to my 0x90skids ctf teamates. When one of my teamates said he got the flag, I was astonished when he mentioned it was through a path I had not intended. We went back and did some testing, and sure enough he had discovered a 0-day Blind SQL Injection. We put up these findings on <a href="https://www.exploit-db.com/exploits/48874" class="highlighted">Exploit-DB</a> and <a href="https://github.com/tcbutler320/TimeClock-1.01-Vuln" class="highlighted">GitHub</a>.

####  **Getting a Hunch** 

This brings me to last week. While updating my website I remembered we could never actually find contact information from the Timeclock Software vendor. I thought it would be fun to brush off the OSINT skills and try to look for them. After some digging I was still unable to find the developers, however one thing did keep coming up, "PHP Timeclock".

After  reading through the <a href="http://timeclock.sourceforge.net" class="highlighted">documentation</a> and the <a href="https://sourceforge.net/projects/timeclock/files/PHP%20Timeclock/" class="highlighed">source code</a>, I began to get a hunch that no SQLi or XSS protections were in place. To make matters worse, it was fairly trivial to do some google dorking and find several live production sites using the application. Some quick static analysis of the login function showed that it should be vulnerable to a blind SQL injction. I immediately started a plan to test the app for vulnerabilities .


####  **Developing a Testing Methodology** 

Since the last official release was in 2006, with some community updates until 2013, I knew that getting a test environment for the app was going to be difficult. I initiatlly started by provisioning an ubuntu droplet on digital ocean and planned on manually installing a LAMP stack.  I quickly realized that deprecated dependancies was going to be a problem. I couldn't even install the right version of PHP from source becuase the Ubuntu compiler was no longer compatible.

My next idea was to run the application in Docker, however after looking at the official supported docker containers for PHP and MySQL, I realized that they did not have versions old enough. PHP Timeclock relies on PHP < 5.50 as it uses the `mysql_pconnect` function deprecated in PHP 5.5.0. In addition, several dependancies in MySQL meant that official docker containers were a no go.


<div class="row">
    <div class="mx-auto">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-13-PHP-TimeClock-0-Day-Disclosure/mysqlp.png" alt="" title="My Custom CTF Challenge"/>
    </div>
</div>  

<br>  

Ultimately, I came across a gimmie in the form of <a href="https://github.com/rodvlopes/php4-mysql4-apache2.2-docker" class="highlighted">rodvlopes/php4-mysql4-apache2.2-docker</a> , a custom docker container built by rodvlops for this exact purpose. Out of the box, the container builds a PHP4, MySQL4, and Apache2 Lamp stack.  Thanks [@rodvlopes](https://twitter.com/rodvlopes)!

####  **Dockerizing PHP Timeclock**

Even with the perfect docker container, it still took quite a bit of work to get PHP Timeclock up and running. The basic process involved downloading the latest version of PHP Timeclock from source forge, putting it in a location where the apache docker image could find it, and making sure all the images could talk to each other. I've updated my github repo [tcbutler320/PHP-Timeclock-1.04-XSS-SQLI](https://github.com/tcbutler320/PHP-Timeclock-1.04-XSS-SQLI) for the vulnerability with the final product. The first time I got it up running I needed to drop into the container with a shell in order to create the database and import the sql config file from PHP Timeclock. The basic steps are more or less the following.

1) Clone the repo  

 `git clone https://github.com/tcbutler320/php-timeclock-docker`

2) cd into the docker folder 

`cd php-timeclock-docker/docker`

3) build docker image 

`docker build -f Dockerfile.ubuntu -t timeclock .`

4) Run the image, exposing container port 80 to localhost port 80, and puttting the timeclock application in the htdocs folder in the container

*Take note here that the file paths are very important. You might find you need to use the root path instead of relative one's. The syntax is /local/path:/docker/container/path . I ended up not using the /data option, which was created with the idea that you can put a mySQL database extract in that location. Instead, I followed steps 6-9 to drop into the container  with a shell and manually import the database*

`docker run -d --name timeclock --restart=always -p 80:80 -v ./data:/usr/local/mysql/var -v ./timeclock-1.04:/usr/local/apache2/htdocs timeclock`

5) Drop into the container with bash  

`sudo docker exec -it timeclock /bin/bash  ` 

6) open a mysql shell 

`mysql -u root -p`, using password IAmroot

7) create the timeclock database 

`create database timeclock;`

8)  exit the mysql shell
   
9)  populate the database with the sql file 

`mysql -u root -p timeclock < /usr/local/apache2/htdocs/create_tables.sql`


After all that was complete, I was finally able to stand up a local test environment. Now it was time to get started looking for vulnerabilities!

<div class="row">
    <div class="mx-auto">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-13-PHP-TimeClock-0-Day-Disclosure/timeclock.png" alt="" title="My Custom CTF Challenge"/>
    </div>
</div>  

<br>

####  **Web Application Testing with BurpSuite**

Going into the vulnerability research phase, I was already pretty confident that a SQL injection should be possible. This was based on a brief static analysis of the login function from sourceforge. My research process was essentially 3-fold, 

1. Automated Scanning with BurpSuite
2. Manual Testing for Injection Vulnerabilities 
3. Static Code Analysis 



<div class="alert alert-warning" role="alert">
 <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>  
 I initially had some isses capturing application traffic with my burpsuite proxy and firefox, but I ultimately solved this by using the built-in chromium browser in burpsuite.
</div>  

To get the container up and running again after It had been stoped, I started it with `docker start [container]`.  

```bash
╭─tylerbutler at Tyler’s MacBook Pro (2) in ~
╰─○ docker container ls -a
CONTAINER ID   IMAGE                COMMAND                  CREATED      STATUS                    PORTS     NAMES
bf3be8ea4cfe   php-timeclock        "/bin/sh -c 'apachec…"   5 days ago   Exited (137) 2 days ago             php-timeclock
╭─tylerbutler at Tyler’s MacBook Pro (2) in ~
╰─○ docker start bf3be8ea4cfe
bf3be8ea4cfe
```


#####  **1: Automated Scanning**  

One of the most powerful automated tools in the BurpSuite arsenal is `active scan`.  The scanner can be configured to crawl web applications to brute force directories, as well as full audit functions to search for commmong vulnerabilities. Using the `active scan` feature in BurpSuite Professional, I started a comprehensive scan of the localhost application. This is one of the benefits for taking the time to stand up my own docker container, I can be as loud as I want during testing.  

Shown in the video below, active scan can be started by;
1. Right click a target 
2. Choose  scan 
3. In the pop-up menu, click *scan configuration*
4. On the bottom, select *Select from Library*. Here you'll have access to BurpSuite's pre-configured library of scan and audit options. I select the most aggressive options since I'm testing locally


<div class="row">
    <div class="mx-auto">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-13-PHP-TimeClock-0-Day-Disclosure/burp-1-hq.gif" alt="" title="My Custom CTF Challenge"/>
   </div>
</div>

######  **Results**  

After waiting for the audit to complete, BurpSuite already found the SQL injection and XSS vulnerabilities. The issues tab shows 3 potential sql injection and 5 cross site scripting injection points. It's worth mentioning that sometimes these results can be false flags, and BurpSuite will not find all vulnerabilities. In fact, there were additional XSS found during manual testing that were not picked up by the scanner. The next step, manual injection testing, will confirm if these parameter's are in fact vulnerable.

<div class="row">
    <div class="mx-auto">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-13-PHP-TimeClock-0-Day-Disclosure/burpsuite-audit-results.png" alt="" title="My Custom CTF Challenge"/>
   </div>
</div>  

#####  **2: Manual Injection Testing**  

###### *XSS* 

Armed with some basic audit information from the automated scanning, it was time to start manually testing each of the findings as well as other sections. Again we can use BurpSuite to do some of the heavy lifting for us. Once you click on the issues tab, you can open and see the exact request and response from the active scan. I started by testing each of the identified findings manually.

1. Click on an issue   
2. Navigate to the "request" tab  
3. Right click the request and select "copy url". If it's a post request or you need request body information, you can also select "request in browser"  
4. Past request URL in browser  

<div class="row">
    <div class="mx-auto">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-13-PHP-TimeClock-0-Day-Disclosure/validation.gif" alt="" title="My Custom CTF Challenge"/>
   </div>
</div>  

<br>


###### *SQLi* 

In addition to the XSS, the BurpSuite audit also found two blind sql injection vulnerabilities. Unlike the XSS found previously, blind sql is tough to test manually through BurpSuite. For this task, I will used <a href="https://sqlmap.org/" class="highlighted">sqlmap</a> to prove exploitability. 

1.  Save the SQL injection BurpSuite request as a file by right-clicking and choosing save
2.  Either start SQLmap request with the -r option to used saved request file, or input url and post body data manually   
   
`sqlmap -u http://localhost/login.php --method POST --data "login_userid=user&login_password=pass" -p login_userid `


<div class="row">
    <div class="mx-auto">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-13-PHP-TimeClock-0-Day-Disclosure/sqlmap-1.gif
" alt="" title="My Custom CTF Challenge"/>
   </div>
</div>  

<br>



#####  **2: Static Code Analysis**  

Using automated tools such as BurpSuite is a great way to find vulnerabilities, but conducting static analysis is a much more comprehensive way to discover all possible attack vectors in an application. Once I've identified the reason why a certain vulnerability exists, it then makes it so much easier to search through the codebase for similar things.  

Take for example the reflected XSS that we found in the above process. Why does this XSS happen on some pages but not others? Lets take a look at login.php and see what vulnerable component is causing this issue. Reading through the code at login.php actually does not show a problem, but several `#includes` at the top show the vulnerable component might be in there. Looking into `include 'topmain.php';`

<script src="https://gist.github.com/tcbutler320/d8a23fa72cd5f510832ffdf58d771b48.js"></script>