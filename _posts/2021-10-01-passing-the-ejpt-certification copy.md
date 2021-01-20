---
title: Passing the eJPT Certification
description: A brief overview of eLearnSecurity's eJPT Certification, the INE Course, and eJPT Exam 
tag: CTF
image: /assets/img/butler,tyler-eJPT-cert.png
layout: post
description: "My thoughts on eLearnSecurity's eJPT Course and Exam "
date:   2021-01-10 20:01:21 -0400
last-updated: 2021-01-10 20:01:21 -0400
tag: certifications
author: Tyler Butler
lead: The eLearnSecurity Junior Penetration Tester certification, commonly referred to as the eJPT, is a great certification for anyone with basic information security skills looking to get into penetration testing. I recently completed the course and passed the certification exam, and will be using this blog post to give my overall impression of the course content
---

The eLearnSecurity Junior Penetration Tester certification, commonly referred to as the eJPT, is a great certification for anyone with basic information security skills looking to get into penetration testing. I recently completed the course and passed the certification exam, and will be using this blog post to give my overall impression of the course content.

## eLearnSecurity Joining INE  
As you may have learned by now, eLearnSecurity recently changed their training delivery model and has joined forces with INE. In the past, eLearnSecurity served as both the certifying body behind the certification as well as delivered the training. As of December 2020, INE is now the preferred eJPT course provider. This has caused a lot of confusion in the infosec community. INE offers several ways to take training on their platform, mainly through "passes". Users can purchase these passes to get access to course content, however these passes are fairly expensive. This lead to some confusion about the new eJPT offering as many users, including myself at first, thought you must purchase an INE pass to take the eJPT course. This is not true! The eJPT course is free on INE, you just need to sign up for the [Free Starter Pass](https://ine.com/blogs/ine-news-updates/ine-releases-new-free-starter-pass), which gives you access to all the eJPT training materials. The only thing which requires payment is purchasing a eLearnSecurity *voucher*. The voucher is what allows you to take the final exam, and costs $200.   

The following video by John Hammond explains this transition in great detail.

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/ymdhCZdARsI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>

## INE Training Platform   

I was very impressed with the eJPT training course on the INE platform, called the *Penetration Testing Student Course (PTS)*. Overall there was over 38 hours of content which was broken down into individual topics with each topic having powerpoint slides, hands-on labs, and videos. The powerpoint slides were a surprise to me, having taken the OSCP course I was expecting all the course content to be delivered in video form. If I had one negative thought about the course it would be that while there were videos that supplement the slides, not every topic included a video. For the overwhelming majority of the course, the self-guided powerpoints was the primary learning material. In other courses such as OSCP, the entire content includes corresponding video portions. With that being said, the slides were well written and easy to follow. The course was broken down into three parts.  
+  Penetration Testing Pre-requisits 
+  Penetration Testing: Preliminary Skills & Programming 
+  Penetration Testing Basics   

<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-10-01-ejpt/pts-img.png">
        <figcaption class="figure-caption text-end">The INE Penetration Testing Student Course</figcaption>
    </div>
</div>
<br/>  


The INE platform has a great UI which allows students to navigate between each of the chapters, marking them as complete as you go. Below is a screenshot of the course dashboard where you can see slides, videos, and a lab.  
<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="assets/img/posts/2021-10-01-ejpt/INE.png">
        <figcaption class="figure-caption text-end">The PTS course dashboard</figcaption>
    </div>
</div>
<br/>  

## PTS Course Labs  
The labs consist of an openvpn file which allows you to remotely connect to the lab environment. Each one is different depending on the topic, but for the most part once you connect to the lab environment you will have one or several machines to interact with. I choose to use the latest installment of Kali Linux as my attacker machine to complete the labs. Each lab has an overview of what the goal of the lab is, the techniques that should be used and the lessons that should be learned. They also include the solutions to the lab should you get stuck. I found that several of the labs were more challenging then the final exam, and that pushing through these challenging labs made me learn more then the course content. There were important lessons learned in the labs that would not have been learned otherwise, so I would encourage anyone taking the exam to complete each lab.  


<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-10-01-ejpt/lab.png">
        <figcaption class="figure-caption text-end">The PTS course labs</figcaption>
    </div>
</div>
<br/>  


## Black Box Practice Penetration Tests 
One great aspect of the PTS course is the 3 Black Box Penetration Tests included at the end. These tests are similar to the labs which an openvpn connection file, however they differ in that each includes several vulnerable boxes. This is very similar to the OSCP student lab enviorment, except for the fact that the OSCP labs has over 40 boxes across 3 subnets, and the PTS Black Boxes each have about 5. These were much more difficult then the final exam, but they provided a great experience to feel out what the final exam format will be.   

## eJPT Certification Exam  
While I can't go into exact details about the exam according to eLearnSecurities policies, I will provide a brief overview of publically disclosed exam information. The exam consisted of a 72 hour window in which you are expected to conduct a penetration test on a black box environment. There are 20 multiple choice questions which you must answer according to what you find during the test. Submitting 15 correct answers will result in a passing score. Overall, I felt extremely well prepared to take the exam after completing the PTS course. As i've stated earlier, the labs and the 3 black box samples are much harder then the final exam, so if you've completed competed and understood the concept behind these then you should have the knowledge to pass the final exam. I took a full day and a half to complete the exam, taking a penetration testing approach by enumerating and documenting as much as I could on each hosts. As you might read online, make sure to pay attention to the networking section of the course, if you end up getting stuck on the exam, everything you need to know *was* included in the training so you should go back and review the section/labs.  

### Exam Tips  
While taking the exam, I found it beneficial to use [CherryTree](https://www.giuspen.com/cherrytree/) for documentation. Cherrytree comes installed by default on the latest version of kali linux, and it makes documented your penetration test findings easy and straight forward.

## Conclusion  
My overall thoughts about the eJPT exam and PTS course are very positive. If this is your first infosec certification and/or you are just getting into penetration testing, the course is easy enough to digest while not skipping on some very important technical aspects. If you are already working in infosec and are considering other more established certifications, I think it is well worth the time and effort to take the exam. With the course being free to take, and the exam costing just $200, it makes sense to add eJPT to your resume. My plans after completing this certification are to complete the eWPT, WebAPP Penetration Testing, and ultimately make another attempt at OSCP. The eJPT course definitely gave me the skills necessary to continue moving towards the OSCP. 

