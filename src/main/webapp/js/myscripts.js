var content = '<div class="logo"><img style="margin-right:-30px;" src="img/usu_logo_small.png" alt="EPI"/></div><div class="logo"><img style="margin-right:-30px; margin-top:-60px " src="img/computer_science_logo_small.png" alt="EPI"/></div><div class="paragraphs"><h2 style="text-align:right; line-height:28px;margin-top:-100px">Software Engineering &#38; Analytic Lab</h2></div><ul><li><a href="http://useal.cs.usu.edu/">Home</a></li><li><a href="index.jsp">Overview</a></li><li><a href="exampleOne.jsp">Example 1</a><li><a href="exampleTwo.jsp">Example 2</a></li><li><a href="videos.jsp">Videos</a></li><li><a href="publications.jsp">Data and Papers</a></li><li><a href="launcher.jsp">MARK tool</a></li></ul><p class="profiles"><a title="GitHub" href="https://github.com"><i class="icon-github-sign"></i></a></p>'
var projectname = '<h1 style="text-align:center">MARK: Mining and Analyzing Reviews by Keywords</h1>'
function loadMenu()
{
  var divSideTag = document.getElementById("menu");
  divSideTag.innerHTML = content;
  var projectNameDiv = document.getElementById("projectname");
  projectNameDiv.innerHTML = projectname;
}