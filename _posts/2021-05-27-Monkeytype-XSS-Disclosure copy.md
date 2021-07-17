---
title: MonkeyType Stored Cross-Site Scripting Vulnerability Disclosure
description: Evading Client Side Validation with Web Socket Modification
featured: true
feature-header: "Featured Research \U0001F447"
tag: Vulnerability Research
image: "/assets/img/posts/2021-05-27-Monkeytype-XSS-Disclosure/preview.png"
layout: post
date: '2021-05-13 00:01:21 -0400'
last-updated: '2021-05-13 00:01:21 -0400'
style: blog1
author: Tyler Butler
lead: Evading Client Side Validation with Web Socket Modification
card: card-2
postid: 1
redirect_from:
- "/monkeytype"
navheader: posts
---

Last week, I discovered a stored cross-site scripting vulnerability in the <a class="highlighted" href="https://dev.monkeytype.com/tribe">dev.monkeytype.com</a> tribe chat, allowing malicious users to inject arbitrary JavaScript script via (1) message and (2) name parameters in the chat room. While the vulnerability is severe, Tribe is currently in an alpha release, so it was a great time to catch and remediate the issue before widespread use. In this post, I'll describe how client-side valdiation was evaded by modifying raw web socket requests. 

####  **Index**  
+  [What is Monkeytype?]({{page.url}}#-what-is-monkeytype)
+  [Vulnerability Disclosure]({{page.url}}#️-vulnerability-disclosure)
   +  [Identified Vulnerabilities]({{page.url}}#authenticated-stored-cross-site-scripting)
   +  [Impact]({{page.url}}#-impact)
   +  [Timeline & Remediation]({{page.url}}#️-timeline--remediation)
+  [What are Web Sockets?]({{page.url}}#-what-are-web-sockets)
   +  [Tribe Socket.io Implementation]({{page.url}}#-tribe-socket-implementation)
   +  [Exploiting Web Sockets]({{page.url}}#-exploiting-web-sockets)


####  **🙊 What is MonkeyType?**

<a class="highlighted" href="https://monkeytype.com">Monkeytype</a> is a popular typing-test application with a growing online community. Started in early 2020, it's quickly become one of the top typing test applications, boasting over 40 million page views. In late May, the lead developer <a class="highlighted" href="https://discord.com/channels/713194177403420752/715361191995768914/843185608683290635">announced</a> some pretty impressive statistics for the site,
+  100k daily unique visitors
+  228k registered accounts
+  139 million started tests
+  54 million completed tests
+  2.22 billion seconds which is around 70 years of typing

####  **☠️ Vulnerability Disclosure**

#####  **Authenticated Stored Cross-Site Scripting**  

The monkeytype <a class="highlighted" href="https://dev.monkeytype.com/tribe">Tribe Chat</a> is vulnerable to stored cross-site scripting via the (1) message and (2) name parameters. While client side validation as implemented, it fell short of protecting malicious payloads that were injected directly in modified socket requests. To be exploited, a malicious user could create or join a chat room, send a normal message, intercepted the socket request and inject a payload into the name or message fields. 


<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-27-Monkeytype-XSS-Disclosure/tribe_stored_xss.png">
    </div>
</div>  

#### **💥 Impact**

The impact of XSS in a chat room is severe. Once injected, the payload would be executed in the context of other user's browsers who were within the same room. These payloads could be used to steal users authentication tokens, allowing complete account takeover. Making the vulnerability worse is the fact that tribe allows users to invite other's to specefic chat rooms. Once a room has been successfully exploited with a XSS payload, a malicious user could then share the link to the specific chat room to others, increasing the number of potential victims.  


#### **⏱️ Timeline & Remediation**


  <div class="timeline mt-1 mb-1">
      <div class="tl-item active">
          <div class="tl-dot b-warning"></div>
          <div class="tl-content">
              <div class="">I disclose the vulnerability to MonkeyType developers on Discord and <a class="highlighted" href="https://github.com/Miodec/monkeytype/issues/1476">Github</a></div>
              <div class="tl-date text-muted mt-1">27 March 2021</div>
          </div>
      </div>
      <div class="tl-item">
          <div class="tl-dot b-danger"></div>
          <div class="tl-content">
              <div class="">MonkeyType developers implement input validation and output encoding</div>
              <div class="tl-date text-muted mt-1">27 March 2021</div>
          </div>
      </div>
    </div>

####  **🔌 What are Web Sockets?**  

<a class="highlighted" href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API">Web sockets</a> are a two way interactive sessions between a client and server. Unlike standard static web pages that require a user to refresh to load content, web sockets can receive responses in near real time. This benefit makes them ideal for chat applications, where multiple clients can be in the same chat room and receive simultaneous updates without requiring any interaction. More information about sockets can be found below, 

<iframe width="560" height="315" src="https://www.youtube.com/embed/1BfCnjr_Vjg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<br/>


#### **⚡ Tribe Socket Implementation**  

To implement sockets for tribe chat, monkeytype uses <a class="highlighted" href="https://socket.io/">sockets.io</a>, a popular socket framework for javascript. While similiar in it's implementation to traditional web sockets, socket.io is slightly different. According to it's documentation, socket.io is *"NOT a WebSocket implementation. Although Socket.IO indeed uses WebSocket as a transport when possible, it adds additional metadata to each packet. That is why a WebSocket client will not be able to successfully connect to a Socket.IO server, and a Socket.IO client will not be able to connect to a plain WebSocket server either"*. The overall socket process for the tribe application looks like the following.  


[*Client <i class="fas fa-angle-double-left"></i> Server*] &nbsp;&nbsp; **User joins/create a chatroom, socket connection 42 initiates**

`42["mp_update_online_stats",{"stats":[9,{"public":[0,0,0,0],"private":2},[0,0,0,0],"0.9.11"],"pingStart":689712.6549999993}]`

[*Client <i class="fas fa-angle-double-right"></i> Server*] &nbsp;&nbsp; **User sends a message to chat room, client sends server message**

`42["mp_chat_message",{"isSystem":false,"isLeader":true,"message":"test","from":{"id":"i6ZO4keqlEgwQHB-AAAc","name":"taeha"}}]`  

[*Client <i class="fas fa-angle-double-left"></i> Server*] &nbsp;&nbsp; **Server Pushes Message to Chat**  

`42["mp_chat_message",{"isSystem":false,"isLeader":true,"message":"test","from":{"id":"i6ZO4keqlEgwQHB-AAAc","name":"taeha"}}]`


#### **💣 Exploiting Web Sockets**    

Exploiting XSS in web sockets is fairly trivial when no input validation or output encoding is used. Just as you would normally intercept a `post` request and add an XSS payload with BurpSuite, you can do the same with web sockets. In this case, since the name and message is both displayed on the chat page, we can use both as valid injection points.


[*Client <i class="fas fa-angle-double-right"></i> Server*] &nbsp;&nbsp; **Malicious User Injects XSS in Socket Message**  

```42["mp_chat_message",{"isSystem":false,"isLeader":true,"message":"test<svg/onclick=alert`xss #1`>","from":{"id":"i6ZO4keqlEgwQHY-AAAm","name":"pwnville<svg/onclick=alert`xss #2`>"}}]```



<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-05-27-Monkeytype-XSS-Disclosure/burp.png">
    </div>
</div>  

