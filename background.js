// background.js 
// chrome.browserAction.onClicked.addListener(captureCurrentTab);

// function captureCurrentTab(){
  
// }
// // Вызывается, когда пользователь нажимает на действие браузера.
// chrome.browserAction.onClicked.addListener(function(tab) {
//     // Отправить сообщение на активную вкладку
//     // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     //   var activeTab = tabs[0];
//     //   chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
//     // });
    
//   });
  
//   // Этот блок новый!
//   chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       if(request.message === "open_new_tab" ) {
//         chrome.tabs.create({"url": request.url});
//       }

//       console.log(request);

//       // setTimeout(function(){
//       //   chrome.tabs.captureVisibleTab(null,{},function(dataUri){
//       //     console.log(dataUri);
//       //   });
//       // }, 3000);

//       if(request.action == 'screen'){
//         chrome.tabs.captureVisibleTab(null,{},function(dataUri){
//           console.log(dataUri);
//         });
//       }
      
      
//     }
//   );


// // chrome.tabs.captureVisibleTab(null,{},function(dataUri){
// //   console.log(dataUri);
// // });

// chrome.extension.onConnect.addListener(function(port) {
//   console.log("Connected .....");
//   port.onMessage.addListener(function(msg) {
//        console.log("message recieved" + msg);
//        port.postMessage("Hi Popup.js");
//   });
// })