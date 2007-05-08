// LastReadPost (server edition)
// $URL$
// $Rev$
// $Author$
// $Date$
// $Id$
//
// Copyright (c) 2007, Matt 'kitzke' Cribbs (mcribbs@gmail.com)
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
// 
// additional updates by: 
//	Collin Grady 2006-08-31
//
// based on
// LastReadPost
// version 1.31
// 2005-06-13
// Copyright (c) 2005, Jon Yurek
// Released under the GPL license

// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "LastReadPostServer", and click Uninstall.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          LastReadPostServer
// @namespace     http://osakanyc.com/
// @description   Adds a link to the last post you read in a thread on the Ars Technica forums.  Stores data on a central server for use on multiple computers.
// @include       http://episteme.arstechnica.com/*/a/frm/*
// @include       http://episteme.arstechnica.com/*/a/tpc/*
// @include       http://episteme.arstechnica.com/*a=frm*
// @include       http://episteme.arstechnica.com/*a=corfrm*
// @include       http://episteme.arstechnica.com/*a=tpc*
// @include       http://episteme.arstechnica.com/*UPDATE_MESSAGE=Y*
// ==/UserScript==

//
// USER MODIFIABLE STUFF
//
var scriptURL = "http://your-domain.com/lrp.php"
// Edit this to change the text of the inserted link.
// The default is "%d new"
var linktext = "%d new";
// addwhere:
// 0 - default - adds the link in the "Last Post" column
// 1 - adds the link after the title of the thread
// 2 - adds the link after the direct page links
// 3 - changes the icon immediately preceeding the title into the link (links to first post if thread unread)
var addwhere = 2;
var icon = 2; // Range 1-14; used with choice #3 above.
var separator = " - "; // Any text. Used to separate the text links for #0-2 above
var menutimeout = 500; // time in ms for the menu to disappear on its own
var menulength = 30; // max length of the menu
var menuon = true; // turn the menu off/on
var linkstyle = {
	fontWeight : "bold"
}; 
var menulinkstyle = {
	display : "block",
	color : "white",
	padding : "2px"
}; 
var menustyle = {
	position : "fixed",
	top : "0px",
	right : "0px",
	background : "green",
	fontFamily : "serif",
	fontSize : "10pt",
	borderLeft : "1px solid black",
	borderBottom : "1px solid black",
	paddingLeft : "7px",
	paddingBottom : "7px"
};
var hideread = false;
//
// END USER MODIFIABLE STUFF
//

function setProps(o,p) {
	for(prop in p) o[prop] = p[prop];
}

function makeURL(key,r,c,p) {
	var fm = key.split(":");
	var cint = parseInt(c);

	// This bit calculates if the LRP is the last one on a page.
	// If it is, make the link for the next page.
	var nextp = Math.ceil((cint + 1) / 40);
	if(nextp > p) return "http://episteme.arstechnica.com/groupee/forums/a/tpc/f/" + fm[0] + "/m/" + fm[1] + "/p/" + nextp;

	// If it's not the last link on a page, give it the right post.
	return "http://episteme.arstechnica.com/groupee/forums/a/tpc/f/" + fm[0] + "/m/" + fm[1] + "/p/" + p + "/r/" + r + "#" + r;
}

function savePostValues(key,r,p,c,t) {
	var optionalParams = "";
	if (p != "") optionalParams = optionalParams + '&p=' + p;
	if (c != "") optionalParams = optionalParams + '&c=' + c;
	if (t != "") optionalParams = optionalParams + '&t=' + escape(t);
	
	GM_xmlhttpRequest({
		method: 'GET',
		url: scriptURL + '?action=set&key=' + key + '&r=' + r + optionalParams,
	});
}

// Copied from http://episteme.arstechnica.com/groupee_common/jscript/eve_constructor.js
function showElement(){ //usage showElement('id1','id2','id3','id4','etc')
 var element;
 for (var i=0; i<=showElement.arguments.length; i++) {
    element = document.getElementById(showElement.arguments[i]);
      if(element){
         element.style.display='';
         // edl: 'block' value causes a "space leak" problem in Firefox
         //element.style.display='block';
      }
 }
}// end fn

// Copied from http://episteme.arstechnica.com/groupee_common/jscript/eve_constructor.js
function hideElement(){  //usage hideElement('id1','id2','id3','id4','etc')
 var element;
 for (var i=0; i<=hideElement.arguments.length; i++) {
    element = document.getElementById(hideElement.arguments[i]);
      if(element == null) { continue };
    element.style.display='none';
 }
}// end fn

var threadnumbers = new Array();
var threadlinks = new Array();
var threadthreads = new Array();

var isForum = (window.location + '').match(/a(\/|=)(cor)?frm/);
var isTopic = (window.location + '').match(/a(\/|=)tpc/);
var isReply = (window.location + '').match(/UPDATE_MESSAGE=Y/);
	
if(isForum) {
	var threadtable = document.getElementById("ev_ubbx_frm");
	var threadrows = threadtable.getElementsByTagName("tr");
	var mthreadrows = new Array();
	var fora = new Array();
	for(var x=0;x<threadrows.length;x++) {
		var atags = threadrows[x].getElementsByTagName("a");
		if(atags.length > 2) {
			var link = atags[1];
			var f = link.getAttribute("href").match(/\/f\/(\d+)/)[1];
			var m = link.getAttribute("href").match(/\/m\/(\d+)/)[1];
			var key = f + ":" + m;
			threadlinks[key] = atags;
			mthreadrows[key] = threadrows[x];
			threadnumbers[key] = -1;
		}
	}

	for(var key in threadnumbers) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: scriptURL + '?action=get&key=' + key,
			onload: function(responseDetails) {
				var values = responseDetails.responseText.split("|");
				var key = values[0];
				var fm = key.split(":");
				var f = fm[0];
				var m = fm[1];
				var r = values[1];
				var p = values[2];
				
				if(typeof(r) != "undefined" && r != "") {
					var oldpostcount = values[3];
					if(!oldpostcount) oldpostcount = 0;
					var rowcells = mthreadrows[key].getElementsByTagName("td");
					var newpostcount = rowcells[4].innerHTML;
					var pcdelta = parseInt(newpostcount) - parseInt(oldpostcount);
					if(pcdelta >= 0) {
						var newurl = makeURL(key,r,oldpostcount,p);
						var newlink = threadlinks[key][1].cloneNode(false);
						newlink.href = newurl;
						setProps(newlink.style, linkstyle);
						if(typeof(linktext) == "undefined" || linktext == "") linktext = "%d new";
						newlink.innerHTML = linktext.replace(/%d/,pcdelta);
						newlink.setAttribute("key", f + ":" + m);
						newlink.addEventListener("click", function(e) {
							//ctrl+shift+click to stop tracking thread
							if(e.shiftKey && e.ctrlKey) {
								GM_xmlhttpRequest({
									method: 'GET',
									url: scriptURL + '?action=remove&key=' + this.getAttribute("key"),
									onload: function(responseDetails) {
										alert("Stopped tracking thread " + this.getAttribute("key"));
									}
								});											
								e.preventDefault();
								e.preventBubble();
								e.preventCapture();
								e.stopPropagation();
								if(addwhere != 3) {
									this.parentNode.style.display = "none";
								}
								else {
									this.href="#";
									this.firstChild.className = "ubb_post";
								}
							}
						}, true);
						//if(pcdelta < 0) newlink.innerHTML = "Refresh";
						var linkcont = document.createElement("span");
						switch(addwhere) {
							case 1: 
								linkcont.appendChild(document.createTextNode(separator));
								linkcont.appendChild(newlink);
								rowcells[2].insertBefore(linkcont,threadlinks[key][1].nextSibling);
								break;
							case 2: 
								linkcont.appendChild(document.createTextNode(separator));
								linkcont.appendChild(newlink);
								rowcells[2].appendChild(linkcont);
								break;
							case 3: 
								threadlinks[key][0].setAttribute("href", newlink.getAttribute("href"));
								threadlinks[key][0].firstChild.setAttribute("class", "ubb_post_icon" + icon);
								threadlinks[key][0].firstChild.setAttribute("alt", newlink.innerHTML);
								threadlinks[key][0].firstChild.setAttribute("title", newlink.innerHTML);
								break;
							default: 
								linkcont.appendChild(document.createTextNode(separator));
								linkcont.appendChild(newlink);
								rowcells[7].appendChild(linkcont);
								break;
						}
					}
				}
			}
		});
	}
}
else if(isTopic) {
	var imgs = document.getElementsByTagName("img");
	var posts = new Array();
	for(var x=0;x<imgs.length;x++) {
		var cl = imgs[x].getAttribute("class") + '';
		if(cl.match(/ubb_post_icon/)) {
			posts.push(imgs[x].parentNode);
		}
	}
	var lastposthref = posts[posts.length-1].getAttribute("href");
	var lpf = lastposthref.match(/\/f\/(\d+)/)[1];
	var lpm = lastposthref.match(/\/m\/(\d+)/)[1];
	var lpr = lastposthref.match(/(\/r\/)|(\?r=)(\d+)/)[3];

	var currentpage = document.getElementById("ev_powered_by").parentNode.nextSibling.getElementsByTagName("b");
	if(currentpage.length > 0) currentpage = currentpage[0].innerHTML;
	else currentpage = 1;

	var title = document.getElementsByTagName("title")[0];
	var titleString = title.innerHTML.substring(0,title.innerHTML.lastIndexOf(" - "));

	GM_xmlhttpRequest({
		method: 'GET',
		url: scriptURL + '?action=get&key=' + lpf + ":" + lpm,
		onload: function(responseDetails) {
			var values = responseDetails.responseText.split("|");
			var savedpage = values[2];
			if (savedpage == undefined) savedpage = 0;
			if(parseInt(savedpage) <= parseInt(currentpage))
			{	
				savePostValues(lpf + ":" + lpm,lpr,currentpage,posts.length + (40 * (currentpage-1)) - 1,titleString);
			}
			
			// Hide read posts if we are on the page of the thread where the last read post is (if viewing previous pages we probably are looking for something so don't hide)
			// Do not hide if savedpage is 0, b/c we haven't read anything yet.
			if(hideread && parseInt(savedpage) == parseInt(currentpage) && parseInt(savedpage) != 0) {
				var last_r = values[1];
				for(var i=0;i<posts.length;i++) {
					var cur_r = posts[i].getAttribute("href").match(/(\/r\/)|(\?r=)(\d+)/)[3];	
					if(cur_r == last_r) {
						break; // quit hiding posts when we hit the last read one
					}
					if(cur_r != lpm)
					{
						showElement('ignore_'+cur_r); 
						hideElement('post_'+cur_r);
					}
				}
			}
		}
	});
}
else if (isReply) {
	if(menuon) {
		var f = (window.location + '').match(/[&\/]f[\/=](\d+)/)[1];
		var m = ((window.location + '').match(/[&\/]m[\/=](\d+)/) ? (window.location + '').match(/[&\/]m[\/=](\d+)/)[1] : "");
		if (m == "") m = (window.location + '').match(/[&\/]t[\/=](\d+)/)[1];
		var r = '';

		var listkey = f + ":" + m;
		var list = [listkey];
		savePostValues(listkey,r,"","","");
		
		GM_xmlhttpRequest({
			method: 'GET',
			url: scriptURL + '?action=getHistory',
			onload: function(responseDetails) {
				var lastfew = responseDetails.responseText;

				if(!lastfew) lastfew = "";
				lastfew = lastfew.split("^^");
		
				for(var x=0;x<lastfew.length;x++) {
					if(lastfew[x] == listkey) continue;
					list.push(lastfew[x]);
				}
			
				list = list.splice(0,menulength);
				var liststring = list.join("^^");
				GM_xmlhttpRequest({
					method: 'GET',
					url: scriptURL + '?action=setHistory&value=' + liststring,
				});
			}
		});
	}
}
else {
	GM_log("We're not on a topic or a forum. We really shouldn't even be in this code.");
}

if(menuon) {
	var protoa = document.createElement("a");
	setProps(protoa.style, menulinkstyle);
	var container = document.createElement("div");
	container.style.display = "none";
	container.style.borderLeft = "1px solid black";
	container.style.borderBottom = "1px solid black";
	container.setAttribute("id", "lastreadpost-container");
	
	GM_xmlhttpRequest({
		method: 'GET',
		url: scriptURL + '?action=getHistory',
		onload: function(responseDetails) {
			var lastfew = responseDetails.responseText;

			if(!lastfew) lastfew = "";
			lastfew = lastfew.split("^^");
			eval("var lastfewEls = "+lastfew.toSource());
		
			for(var x = 0; x < lastfew.length; x++) {
				GM_xmlhttpRequest({
					method: 'GET',
					url: scriptURL + '?action=get&key=' + lastfew[x],
					onload: function(responseDetails) {
						var values = responseDetails.responseText.split("|");
						if (values.length > 1) {
							var key = values[0];
							var r = values[1];
							var p = values[2];
							var title = values[4];
							var count = values[3];
							if(title) {
								var newa = protoa.cloneNode(true);
								newa = protoa.cloneNode(true);
								newa.innerHTML = title;
								newa.href = makeURL(key,r,count,p);
								newa.style.background = x%2 ? "white" : "#eee";
								newa.setAttribute("normal" , x%2 ? "white" : "#eee");
								newa.setAttribute("highlight" , x%2 ? "#ddd" : "#ccc");
								newa.style.color = "black";
								newa.addEventListener("mouseover", function(){this.style.background=this.getAttribute("highlight")}, false);
								newa.addEventListener("mouseout", function(){this.style.background=this.getAttribute("normal")}, false);
								for (var i = 0; i < lastfewEls.length; i++) {
									if (lastfewEls[i] == key) {
										lastfewEls[i] = newa;
									}
								}
							}
							for (var i = container.childNodes.length - 1; i >= 0; i--) {
								container.removeChild(container.childNodes[i]);
							}
							for (var i = 0; i < lastfewEls.length; i++) {
								try {
									container.appendChild(lastfewEls[i]);
								} catch (e) {}
							}
						}
					}
				});
			}
		}
	});


	var toggle = document.createElement("a");
	toggle.innerHTML = "Most Recently Read";
	setProps(toggle.style, menulinkstyle);

	var menu = document.createElement("div");
	menu.id = "lastreadpost-menu";
	setProps(menu.style, menustyle);

	//menu.appendChild(toggle);
	menu.appendChild(container);

	var menutimeout = null;
	menu.addEventListener("click",function(e) {
		var c = document.getElementById("lastreadpost-container");
		c.style.display = (c.style.display == "none" ? "block" : "none");
		e.stopPropagation();
	}, false);

	menu.addEventListener("mouseover",function(e) {
		var c = document.getElementById("lastreadpost-container");
		c.style.display = "block";
		if(menutimeout) clearTimeout(menutimeout);
	}, false);

	menu.addEventListener("mouseout",function(e) {
		var c = document.getElementById("lastreadpost-container");
		if(menutimeout) clearTimeout(menutimeout);
		menutimeout = setTimeout(function(){
			c.style.display = "none";
		},menutimeout);
	}, false);

	document.getElementsByTagName("body")[0].appendChild(menu);
}

try { document.getElementById("ev_copy_txt").innerHTML += "<br><br><a href='http://code.google.com/p/lastreadpost/'>LastReadPost (server edition) $Rev$ </a>";} catch(e) {}
