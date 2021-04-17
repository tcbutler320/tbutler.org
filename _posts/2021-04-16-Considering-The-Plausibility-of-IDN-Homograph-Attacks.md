---
title: Considering the Plausibility of IDN Homograph Attacks on iOS 
description: Abusing Unicode Character “ɴ” (U+0274) to Spoof News Media Organizations
tag: research
image: /assets/img/preview.png
layout: post
description: "Abusing Unicode Character “ɴ” (U+0274) to Spoof News Media Organizations"
date:  2021-04-16 00:01:21 -0400
last-updated: 2021-04-16 00:01:21 -0400
tag: research
author: Tyler Butler
lead: ""
card: card-2
---

<figure class="figure">
  <img src="/assets/img/ios.png" class="figure-img img-fluid rounded" alt="Pictured above, previews of a real NYT article being sent via iMessage(left) and a spoofed NYT article which points to an attacker-owned domain (right)">
  <figcaption class="figure-caption text-right">Pictured above, previews of a real NYT article being sent via iMessage(left) and a spoofed NYT article which points to an attacker-owned domain (right)</figcaption>
</figure>

Back in December of 2020, I disclosed a novel threat vector to Apple regarding the ability to create Homograph Attacks on iOS devices using iMessage and Safari. The central issue at hand was the way iOS handles International Domain Name's in iMessage preview. Using the techniques described in my research, a motivated threat actor can send an iMessage link that spoofs popular news organizations, and could be used to spread misinformation or deliver targeted malware. Apple has elected not to address the concern, on the basis that there is a  *"visually distinguishable difference"*, as such, I am publishing the report in its entirety.


<a href="/assets/pdf/Butler,Tyler-Considering-the-Plausibility-of-IDN-Homograph-Attacks-on-iOS.pdf"><button type="button" class="btn btn-dark">Read the Full Report</button></a>

### Abstract 
*The introduction of International Domain Names (IDNs) drastically increased the potential availability of homograph exploitsthe use of Unicode characters to create misleading information, most notably domain names. In the years since, several mitigation strategies have been deployed by leading developers to protect users from risk. Despite these developments, Apple’s iOS devices continue to be susceptible IDN homograph exploits. The research builds on previous work and considers the plausibility of abusing design features in Apple iOS devices to exploit IDN homographs to spread misinformation and targeted malware, specifically with the ability to spoof popular news media outlets. It finds that iOS devices continue to be susceptible to such attacks, and describes techniques used to abuse features in iMessage, Messages, and Safari Web Browser This flaw leaves iOS users at significant risk of spoofing attacks which can be used to spread misinformation, steal credentials, or deliver targeted malware. Of particular concern is the ability for hostile governments to use the described techniques to target journalists with spyware. The research was presented to Apple in December of 2020, and the vendor has identified they will not be issuing a fix.*