// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//   var action_url = "http://www.reddit.com/submit?url=" + encodeURIComponent(tab.href) + '&title=' + encodeURIComponent(tab.title);
//   chrome.tabs.create({ url: action_url });
// });


// https://stackoverflow.com/questions/71542944/chrome-extension-opening-in-new-tab
// chrome.action.onClicked.addListener((tab) => {
//     //var newURL = chrome.runtime.getURL("tab.html");
//     chrome.tabs.create({ url: "https://bocado.news/boca/" + tab.url, index: tab.index + 1, selected: true, active: true });
// });


// https://groups.google.com/a/chromium.org/g/chromium-extensions/c/gywzLNsOMVI
// https://stackoverflow.com/questions/54821584/chrome-extension-code-to-get-current-active-tab-url-and-detect-any-url-update-in
// async function getCurrentTab() {
//   let queryOptions = { active: true, currentWindow: true };
//   let [tab] = await chrome.tabs.query(queryOptions); // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   return tab;
// }

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);

const bocaHash = s => "boca" + hashCode(s);
const bocaUrl = s => "https://bocado.news/boca/" + s;

// https://stackoverflow.com/questions/71918972/in-a-chrome-extension-detect-tab-already-open-and-switch-to-it-otherwise-crea
// The solution requires adding a Javascript Promise, a call to chrome.tabs.get(), and chrome.tabs.highlight(), using chrome.storage to store the tab.id, along with some error handling on chrome.runtime.lastError to your existing code.
const openTab = (key, url, index) => {
    new Promise((tabId) => {
        chrome.storage.local.get(key, function(tabs){
            tabId(tabs[key] || 0);
        });
    })
    .then((tabId) => {
        chrome.tabs.get(tabId, function(result){
            if (chrome.runtime.lastError) {
                chrome.tabs.create({url: url, index: index, active: true }, function(newTab){
                    chrome.storage.local.set({ [key]: newTab.id }); // https://stackoverflow.com/questions/11692699/chrome-storage-local-set-using-a-variable-key-name
                });
            } else {
                chrome.tabs.highlight({tabs: result.index});
            }
        });
    });
};

chrome.action.onClicked.addListener(function(tab){
    openTab(bocaHash(tab.url), bocaUrl(tab.url), tab.index + 1);
});

// chrome.action.onClicked.addListener((tab) => {
//     var value = "test";

//     chrome.storage.local.set({ key: value }).then(() => {
//         console.log("Value is set to " + value);
//     });

//     chrome.storage.local.get(["key"]).then((result) => {
//         console.log("Value currently is " + result.key);
//     });
// });


