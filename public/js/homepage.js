 

function loginRegisterDisplayHandlingFunction(){
    $("div#create").toggleClass("create-account-page");//add hence makes the display as none
 $("div#login").toggleClass("login-page") ;//remove hence prevents display from none

}


function emptyspan(){
 
 
   
  $("span[name='contactspan']").remove();
       
      return ;
}
function vallidator(){
 
   var answera=true;
//vallidator for complete name

   
   var ans=$("input#names").val();
    
  for(var i=0;i<ans.length;i++){
     
      if(ans[i]=='@' || ans[i]=='#')
      {          answera=false;
          // console.log("error");
          
          $("span[name='namespan']").text("*Error:name can not have special characters in it");
     
      break;
           
      }
     
  }
  if(answera===true)
  {
    $("span[name='namespan']").remove();
  }
  //vallidator for contact
   var answerb=true;
  var count=0;
  var len=$("input#contacts").val();
while(len%10!=len)
{ 
count++;
len=len/10;
}
if(count+1!=10)
  {
      $("span[name='contactspan']").text("*ERROR:must be 10 digits");

  answerb=false;
 
}
if(answerb===true)
{
  $("span[name='contactspan']").remove();
}
if(answera===false||answerb===false){
  return false;
}else{
  alert("you have sucessfully registered");
  return true;
}

    
  
  
  
  



}



function addplaceholder(){
  $("div.forhide").toggleClass("hide");
  $("div.visible ").toggleClass("hide");
  // $("button.forhide").toggleClass("hide");
  $("button.savebtn").after("<button class='btn btn-primary removesavebtn' type='submit'>Save Changes</button>");
  // $("button.savebtn").toggleClass("hide");
  $("button.savebtn").remove();

  

}
function save(){
  // $("input:not(.changed)").prop('disabled',true);
  $("button.savebtn").toggleClass("hide");
  $("button.removesavebtn").remove();//removing the save changes button
  $("div.forhide").toggleClass("hide");
  $("div.visible ").toggleClass("hide");

}
// function addclass(){
//   $(this).addClass("changed");
// }