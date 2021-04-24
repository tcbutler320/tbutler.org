var title = "{{page.title}}"
var lead = "{{page.lead}}"
var author = "{{page.author}}"

var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
ctx.font="30px Arial";
ctx.fillText(title,10,50);
ctx.fillText(lead,10,100);


// save img
Canvas2Image.saveAsImage(c, 1200, 628, 'png');
