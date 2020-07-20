---
layout: post
title: Creating Stranger Servers CTF
date: 2020-07-22 01:00 +0700
modified: 2020-07-22 01:00 +0700
description: How I built my first CTF Challenge
tag:
  - CTF
image: /creating-stranger-servers/stranger-servers-ctf.png
author: Tyler Butler
summary: How I built my first CTF Challenge
comments: true
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

<div class="alert alert-danger alert-dismissible fade show" role="alert" >
  <strong class="text-dark">Before you Read!</strong> This article will contain spoilers, if you want to solve this challenge, have a go before reading.
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>  

<a href="https://0x90skids.com/ctf/"><button type="button" class="btn btn-dark">Go to Challenge</button>
</a> 


## Challenge Infrastructure 

The main challenge website is hosted on an apache webserver on a basic tier server from digital ocean. This is not the cheapest way to host a challenge, however, I chose this design because I was already using the server as a testing ground for vulnerability research into the timeclock application. 

## Set up Steps 

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


#### Configuring Vulnerable PHP Applications
The idea for this CTF was to use the [timeclock](http://timeclock-software.net/) application, a basic php app which enables employers to track empolyee working time through an apache,php,mysql website. 


#### Website Generation

