---
title: Considering the Plausibility of IDN Homograph Attacks on iOS 
description: Abusing Unicode Character “ɴ” (U+0274) to Spoof News Media Organizations
featured: true  
feature-header: "Featured Research 👇"
tag: research
image: "https://res.cloudinary.com/tbutler-org/image/upload/c_scale,w_443/v1619375075/alexander-shatov-PEJtZfT6C1Q-unsplash_bupjja.jpg"
layout: post
date:  2021-04-16 00:01:21 -0400
last-updated: 2021-04-16 00:01:21 -0400
style: blog1
tag: "Vulnerability Research"
author: Tyler Butler
lead: "Abusing Unicode Character “ɴ” (U+0274) to Spoof News Media Organizations"
card: card-2
redirect_from:
  - /2021/04/16/considering-the-plausibility-of-idn-homograph-attacks
  - /considering-the-plausibility-of-idn-homograph-attacks
---
  
#### TL;DR

Back in December of 2020, I disclosed a novel threat vector to Apple regarding the ability to create Homograph Attacks on iOS devices using iMessage and Safari. The central issue at hand was the way iOS handles International Domain Name's in iMessage preview. Using the techniques described in my research, a motivated threat actor can send an iMessage link that spoofs popular news organizations, and could be used to spread misinformation or deliver targeted malware. Apple has elected not to address the concern, on the basis that there is a  *"visually distinguishable difference"*. I respect their decision, but as the risks of such attacks could be easily mitigated using currently in use mitigation strategies, I am publishing the research for wider review.  

*For the full research, including citations and detailed graphics, see the* <a href="/assets/pdf/Butler,Tyler-Considering-the-Plausibility-of-IDN-Homograph-Attacks-on-iOS.pdf" class="badge badge-dark text-light">PDF Report</a>

<figure class="figure">
  <img src="/assets/img/ios.png" class="figure-img img-fluid rounded" alt="Pictured above, previews of a real NYT article being sent via iMessage(left) and a spoofed NYT article which points to an attacker-owned domain (right)">
  <figcaption class="figure-caption text-left">Pictured above, previews of a real NYT article being sent via iMessage(left) and a spoofed NYT article which points to an attacker-owned domain (right)</figcaption>
</figure>


#### Abstract 
*The introduction of International Domain Names (IDNs) drastically increased the potential availability of homograph exploitsthe use of Unicode characters to create misleading information, most notably domain names. In the years since, several mitigation strategies have been deployed by leading developers to protect users from risk. Despite these developments, Apple’s iOS devices continue to be susceptible IDN homograph exploits. The research builds on previous work and considers the plausibility of abusing design features in Apple iOS devices to exploit IDN homographs to spread misinformation and targeted malware, specifically with the ability to spoof popular news media outlets. It finds that iOS devices continue to be susceptible to such attacks, and describes techniques used to abuse features in iMessage, Messages, and Safari Web Browser This flaw leaves iOS users at significant risk of spoofing attacks which can be used to spread misinformation, steal credentials, or deliver targeted malware. Of particular concern is the ability for hostile governments to use the described techniques to target journalists with spyware. The research was presented to Apple in December of 2020, and the vendor has identified they will not be issuing a fix.*

#### Introduction  

The Domain Network System (DNS) was a foundational internet protocol that dictated the available characters which could be
used to name websites. Its nascent form included the 256 characters in the popular character encoding set ASCII (The American
Standard Code for Information Interchange). This satisfied the needs of Western societies as the American standard includes all
letters in the English alphabet, numbers, control characters, and special characters like punctuation marks. Non-English speakers
would not be able to register domain names using their native language until 2007 when International Domain Names (IDNs)
were first introduced.  

IDNs enabled additional characters sets to be used such as Chinese, Portuguese, and Scandinavian
languages. While providing benefits the protocol brought criticism for enhancing the ability to register domains that are
homographs.2 A homograph is a word formed using homoglyphs- western characters that are identical or nearly identical to nonwestern characters.
The concern that homograph IDNs could be used as a method for spoofing popular domains forced developers to adopt a wide
range of mitigation strategies. These strategies included representing IDNs in punycode, whitelisting select IDNs, and colorcoded scripts. Despite available options, many applications have been slow to adopt a comprehensive solution.3 For example, Mozilla’s Firefox uses a combination of IDN whitelist and a custom algorithm. According to the policy, certain whitelisted IDN’s are always shown in punycode, the rest are determined based on a series of restrictions identified by the Unicode
Technical Standard 39, such as common + inherited + a single script. Apple first started to address the issue with IDNs in 2010. The first version of Safari web browser to use punycode was its Safari 5 release in mid 2010.3 While Apple’s Safari maintains a whitelist, the threat of unknown or unblocked IDNs still remains at large.  

#### Method  
To demonstrate the risks of current iOS design features related to the display of IDNs, a proof of concept was established to
create false and misleading websites spoofing top news reporting agencies. The technique involves 3 main components;
identification and registration of homograph domains, development of cloned websites, and smishing users with IDN exploits.
Once each step was complete, the results of the iOS IDN display was then compared against Google Chrome. The POC is tested
on iOS Messages and Safari for MacBook (macOS Catalina 10.15.7) and for iPhone ( iPhone Xs Max 14.0.1).  

#### Identification and Registration of Homograph Domains  


This report does not make an assessment of the amount of available homograph domains not whitelisted and thus still in
circulation, nor does it consider a wide range of homoglyphs that can be used for such attack. Because this research was limited
to specifically target IDN attacks related to misinformation, characters that are most often used in domains for media websites
were considered. Unicode Character “ɴ” (U+0274) was chosen to be an ideal homoglyph because it is used in many media
domains. Of the top 50 newspapers by average Sunday circulation for Q3 2015, Q3 2016, Q3 2017 and Q3 2018 identified by
Pew, 68% used the character “n”. Due to its popularity in American discourse, The New York Times was chosen to be
the domain for this research, and the homograph https://www.ɴytimes.com was registered on Google Domains. Another plausible
homoglyph that was considered was Unicode Character “ȷ” (U+0237), which can replace “j” in sites like The Wall Street Journal
(wsj.com). 

<table class="mx-auto table table-striped table-hover table-responsive">
  <thead class="thead-dark">
    <tr>
      <th scope="col">Organization Name</th>
      <th scope="col">Original Domain</th>
      <th scope="col">IDN Homograph Domain</th>
      <th scope="col">Unicode Character</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">The New York Times</th>
      <td>https://nytimes.com/</td>
      <td>https://ɴytimes.com</td>
      <td>“ɴ” (U+0274)</td>
    </tr>
    <tr>
      <th scope="row">The New York Post</th>
      <td>https://nypost.com/</td>
      <td>https://ɴypost.com</td>
      <td>“ɴ” (U+0274)</td>
    </tr>
    <tr>
      <th scope="row">NPR</th>
      <td>https://npr.org</td>
      <td>https://ɴpr.com</td>
      <td>“ɴ” (U+0274)</td>
    </tr>
   <tr>
      <th scope="row">Fox News</th>
      <td>https://foxnews.com</td>
      <td>https://foxɴews.com</td>
      <td>“ɴ” (U+0274)</td>
    </tr>
   <tr>
      <th scope="row">ABC News</th>
      <td>https:/abcnews.com</td>
      <td>https://abcɴews.com</td>
      <td>“ɴ” (U+0274)</td>
    </tr>
   <tr>
      <th scope="row">NBC News</th>
      <td>https://nbcnews.com</td>
      <td>https://nbcɴews.com</td>
      <td>“ɴ” (U+0274)</td>
    </tr>
    <tr>
      <th scope="row">CBS News</th>
      <td>https://cbsnews.com</td>
      <td>https://cbsɴews.com</td>
      <td>“ɴ” (U+0274)</td>
    </tr>
    <tr>
      <th scope="row">The Wall Street Journal</th>
      <td>https://wsj.com</td>
      <td>https://wsȷ.com</td>
      <td>“ȷ” (U+0237)</td>
    </tr>
  </tbody>
</table>  

#### Development of Cloned Domain Websites
The website to serve as the spoofed domain was developed using Jekyll, a static website generator written in Ruby. First, a Jekyll theme was selected for its resemblance to the New York Times domain. The Aspirethemes type theme was selected for its minimalistic design, making it easily adaptable. To make the site resemble the New York Times, raw html content was copied from the original article using the Google Chrome Inspector Tools. The entire header and body HTML contents were copied and pasted into the theme template. Figure 1 shows a screenshot of copying the html content.  

In order to ensure that iMessage previews would be the same between the real website link and the spoofed one, it was crucial to copy meta tag headers used to generate such previews. With the same tags being used in both sites, the previews would also be the same. Generating the site preview using the local Jekyll development server revealed the resulting spoof site was a nearly identical to the original site. A small selection of JavaScript functions did not work because the original code searched for .js files from a relative path /vi-assets/static-assets/. This was fixed by replacing all instances with the original link path https://www.nytimes.com/vi-assets/static-assets/. GitHub was used to store the source code for the new spoofed site, and Netlify was used to host the domain.   


#### Smishing Users with IDN Exploits  

Delivering the IDN homograph exploit to a sample user was achieved by sending a link to the spoof domain through iMessage. It did not matter whether the link was sent in IDN or punycode form, as iMessage preview automatically converted the punycode domain back into its IDN equivalent. Figure 2 shows this conversion process. iMessage preview is pivotal to the relevance of this exploit, as additional information shown to the user such as the preview image and subject line add to the authenticity of the link. 



#### Results 
Overall using Unicode Character “ɴ” (U+0274) as an IDN homograph exploit on iOS devices was determined to be an effective
method of spoofing news media websites and fooling users into trusting an attacker owned domain. The most effective threat
vector is to use iMessage for iPhone, as there is no option to “hover over” the link, which on iMessage for MacBook converts the
IDN domain into its punycode form. This conversion was the only noticed defense employed by Apple to evade such confusion.
In comparison to Google Chrome, Safari web browser did not protect users by using punycode in the website address bar.
iMessage IDN Preview Results.  

When the two links were previewed using iMessage on both MacBook and iPhone, the difference was barely noticeable. Both the
preview image and link subject line were the same. The Unicode character “n” is slightly noticeable, but without a side by side
comparison it would be difficult for the average user to know the difference. The only use of punycode found was that when
hovering over the spoofed link on the MacBook the domain would pop-up in punycode, shown in Figure 4. This preview only
appears if hovering for a few seconds, and a normal click of the link does not trigger the preview.


<figure class="figure">
  <img src="/assets/img/figure2.png" class="figure-img img-fluid rounded" alt="Figure 2">
  <figcaption class="figure-caption text-left">Figure 2:  Shows iMessage Converting a text with Punycode domain into its IDN equivalent </figcaption>
</figure>

<figure class="figure">
  <img src="/assets/img/figure3.png" class="figure-img img-fluid rounded" alt="Figure 3">
  <figcaption class="figure-caption text-left">Figure 3: Previews of the real article (left) and the spoofed IDN article (right) are shown in iMessage’s on MacBook </figcaption>
</figure>

<figure class="figure">
  <img src="/assets/img/figure4.png" class="figure-img img-fluid rounded" alt="Figure 4">
  <figcaption class="figure-caption text-left">Figure 4:  Hovering a cursor over iMessage Link Preview shows punycode domain </figcaption>
</figure>  

#### Safari IDN Preview Results
The difference in appearance between the spoofed domain and the legitimate New York Times article is barely noticeable to the
naked eye on Safari. Figures 6 and 7 show that Chrome (left), shows the punycode domain name of the IDN site. Punycode is
used here because this domain violates several IDN rules in use by Chrome. This is in stark contrast to Safari, which does not.   

<figure class="figure">
  <img src="/assets/img/figure67.png" class="figure-img img-fluid rounded" alt="Figure 4">
</figure>  


Similar results were found on MacBook. Safari shows the spoofed domain in its IDN form while Chrome shows the domain in
punycode format. Other noticeable differences can be seen such as the “New York Times” Logo placement being located in
different spots; however, this is due to mistakes in the cloning process.  

<figure class="figure">
  <img src="/assets/img/figure8.png" class="figure-img img-fluid rounded" alt="Figure 4">
</figure>  


#### Use Cases
The research presented describes a valid social engineering method that could be employed by various threat actors to deliver
targeted malware to a vulnerable user. Due to the fact that the domains used in this report already violated IDN rules on many
applications, the exploit is limited for use on only iOS targets. Additionally, any target which has changed their default web
browser settings to chrome or other browsers would have additional protection from this attack. For the exploit to be used
successfully, research would need to be conducted to confirm the targets browser settings. Possible use cases include threat actors
such as foreign intelligence services attempting to target journalists with spyware, criminal operations engaged in phishing and
smishing operations, and advanced misinformation operations designed to target particular users with targeted messaging.  

*Example: Targeted Misinformation*  
An attacker can use this technique to send a target a crafted article that aims to change their views on a particular topic. An
obvious pitfall to this attack is that secondary validation by the target to search for other articles on the topic would show the
payload was the only source.    

<figure class="figure">
  <img src="/assets/img/figure10.png" class="figure-img img-fluid rounded" alt="Figure 4">
</figure>  

