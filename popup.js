chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    // console.log(response.farewell);
}); 

$(document).ready(function () {
    $('body').on('click', '#create_screen',function(){
        chrome.runtime.sendMessage({action: "screen"}, function(response) {
            console.log(response.farewell);
        }); 
    });
    
    $('#create_screen').click(function(){
      
    })
});


function screen(){
    chrome.runtime.sendMessage({action: "screen"}, function(response) {
        console.log(response.farewell);
    }); 
}