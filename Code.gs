//CHANNEL_ACCESS_TOKENを設定
//LINE developerで登録をした、自分のCHANNEL_ACCESS_TOKENを入れて下さい
var CHANNEL_ACCESS_TOKEN = 'NP8ujA7QhRWpPQcM9lwWgX8rPgeWE4aexBvCh82bnp2eNpyHMy4yU+iV/iYegDEP/151+s86f5Yg21/0izKVql7LtngJB2vwjsKClLn9/f1c67FCFKwl5fA1b2vukUto1SFLwAnsMWujrRTGDvwrBAdB04t89/1O/w1cDnyilFU='; 
var line_endpoint = 'https://api.line.me/v2/bot/message/reply';

//https://developers.line.me/ja/reference/messaging-api/

//ポストで送られてくるので、ポストデータ取得
//JSONをパースする
function doPost(e) {
  var json = JSON.parse(e.postData.contents);

  //返信するためのトークン取得
  var reply_token= json.events[0].replyToken;
  if (typeof reply_token === 'undefined') {
    return;
  }

  //送られたLINEメッセージを取得  
  var user_message;
  //返信する内容を作成
  var reply_messages = ["Sorry I can't answer anything"];
  var messages = reply_messages.map(function (v) {
    return {'type': 'text', 'text': v};    
  }); 


  if (json.events[0].message.type == "text"){
    user_message = json.events[0].message.text;
    var messages = reply_messages.map(function(v) {
      return {
              "type": "template",
              "altText": "this is a confirm template",
              "template": {
              "type": "buttons",
              "text": "Where do U now?",
              "actions": [
                //{
                //  "type": "message",
                //  "label": "Yes",
                //  "text": "yes"
                //},
                //{
                //  "type": "message",
                //  "label": "No",
                //  "text": "no"
                //},
                {
                  "type": "uri",
                  "label": "locaton",
                  "uri": "line://nv/location"
                }
              ]
            }
           }
      });    
    
    //if ('かっこいい' == user_message) {
    ////かっこいいと入力された際
    //reply_messages = ['「' + user_message + '」ですね？\n' + '「' + user_message + '」はこちらになります。\n' + 'https://hogehoge.com',];

    //} else if ('かわいい' == user_message) {
    //  //かわいいと入力された際
    //  reply_messages = ['「' + user_message + '」ですね？\n' + '「' + user_message + '」はこちらになります。\n' + 'https://hogehoge.com',];

    //} else if ('普通' == user_message) {
    //  //普通と入力された際
    //  reply_messages = ['「' + user_message + '」ですね？\n' + '「' + user_message + '」はこちらになります。\n' + 'https://hogehoge.com',];
    //} else if ('です' == user_message) {
    //  //ですと入力された際
    //  reply_messages = ['どんまい'];
    //} else {
    //  //かっこいい、かわいい、普通が入力されたときの処理
    //  reply_messages = [user_message];
    //}
        
  } else if (json.events[0].message.type == "location") {
    var address = json.events[0].message.address;
    var ratitude = json.events[0].message.latitude;
    var longitude = json.events[0].message.longitude;
    reply_messages = [address,ratitude,longitude,];  
  } else if (json.events[0].message.type == "sticker") {
    reply_messages = [json.events[0].message.packageId,];
  } else {
    reply_messages = [json.events[0].message.type,];
  }
  // Tips&Care：reply_massage は　[,]　で囲む必要がある
  // Tips&Care：line のメッセ時で[,]の,はメッセージを別々で送ってくれる！
  
  // メッセージを返信==================================================
  //lineのendpointにアクセス、自分のアクセストークンを経由して、返信メッセを送る
  //payload?JSONの構文で送ればParseしてくれるはず。
  //
  UrlFetchApp.fetch(line_endpoint, {
    'headers': {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
    'replyToken': reply_token,
    'messages': messages,
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);  
}
