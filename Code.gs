//CHANNEL_ACCESS_TOKENを設定
//LINE developerで登録をした、自分のCHANNEL_ACCESS_TOKENを入れて下さい
var CHANNEL_ACCESS_TOKEN = 'NP8ujA7QhRWpPQcM9lwWgX8rPgeWE4aexBvCh82bnp2eNpyHMy4yU+iV/iYegDEP/151+s86f5Yg21/0izKVql7LtngJB2vwjsKClLn9/f1c67FCFKwl5fA1b2vukUto1SFLwAnsMWujrRTGDvwrBAdB04t89/1O/w1cDnyilFU='; 
var line_endpoint = 'https://api.line.me/v2/bot/message/reply';
var line_push_url = 'https://api.line.me/v2/bot/message/multicast';


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
    var id = json.events[0].source.userId;
    user_message = json.events[0].message.text;
    if (user_message == "遅延")
    {
      messages = GetTrainDerayInformation();
    }else{
      messages = [{"type":"text","text":id},{
                "type": "template",
                "altText": "this is a confirm template",
                "template": {
                "type": "buttons",
                "text": "Where do U now?",
                "actions": [
                  {
                    "type": "uri",
                    "label": "locaton",
                    "uri": "https://gmp-test.mybluemix.net/"
                  }
                ]
              }
             }]
     }
  } else if (json.events[0].message.type == "location") {
    var address = json.events[0].message.address;
    var latitude = json.events[0].message.latitude;
    var longitude = json.events[0].message.longitude;
    var location = [latitude,longitude];
    //var arrRest = GetGNAVIData(latitude,longitude,"3",4);
    var messages = [
      {"type":"text","text":"1kmの範囲にある店だよ！"},
      GetGNAVIDataforFlexMessage(latitude,longitude,"3",10)
    ]
    
  } else if (json.events[0].message.type == "sticker") {
    //messages = ReturnJSONFlexMessage();
    messages = [GetGNAVIDataforFlexMessage()];
  } else {
    messages = [json.events[0].message.type,];
  }
  console.log(messages);
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

function GetGNAVIData(latitude,longitude,range,num) {
  var url = "https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=5a3c4e4079c7245added805e58a91e94";
  latitude = (latitude == null) ? "35.0576" : latitude;
  longitude = (longitude == null) ? "136.93" : longitude;
  range = (range == null) ? "3" : range;
  num = (num == null) ? 8 : num;
  var request = url + "&latitude=" + latitude + "&longitude=" + longitude + "&range=" + range;
  var response = UrlFetchApp.fetch(request);
  var json = JSON.parse(response.getContentText());

  var jsonLength = Object.keys(json.rest).length;//ヒットした件数を取得する
  var arrArea = [];//出力する値を入れるための配列

  if(jsonLength < 1){
    return;
  }else if(jsonLength < num + 1){
    jsonLength = jsonLength;
  }else{
    jsonLength = num;
   }//3つまでを出力

  for (var i=0;i<jsonLength;i++){
    // 出力したい情報を配列に入れていく
    //arrArea.push(json.rest[i].name);
    arrArea.push({"type": "uri","label": json.rest[i].name,"uri": json.rest[i].url});
    //arrArea.push([json.rest[i].url,
    //              json.rest[i].name,
    //             ]);
  }
  return arrArea;
}

function GetGNAVIDataforFlexMessage(latitude,longitude,range,num) {
  var url = "https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=5a3c4e4079c7245added805e58a91e94";
  latitude = (latitude == null) ? "35.0576" : latitude;
  longitude = (longitude == null) ? "136.93" : longitude;
  range = (range == null) ? "3" : range;
  num = (num == null) ? 3 : num;
  var request = url + "&latitude=" + latitude + "&longitude=" + longitude + "&range=" + range;
  var response = UrlFetchApp.fetch(request);
  var json = JSON.parse(response.getContentText());

  var jsonLength = Object.keys(json.rest).length;//ヒットした件数を取得する
  var arrArea = [];//出力する値を入れるための配列

  if(jsonLength < 1){
    return;
  }else if(jsonLength < num + 1){
    jsonLength = jsonLength;
  }else{
    jsonLength = num;
   }//3つまでを出力

  for (var i=0;i<jsonLength;i++){
    // 出力したい情報を配列に入れていく
    //arrArea.push(json.rest[i].name);
    var name = json.rest[i].name;
    var url = json.rest[i].url_mobile;
    var gnavi_url = "https://api.gnavi.co.jp/api/img/credit/api_225_100.gif"
    var img_url = (json.rest[i].image_url.shop_image1 == "") ? gnavi_url : json.rest[i].image_url.shop_image1;
    arrArea.push(
      {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": img_url,
          "size": "md", 
           "action":{
             "type": "uri",
             "uri": url            
          }          
         },
        "body": {
          "type" : "box",
          "layout": "vertical",
          "contents":[
            {
             "type": "text",
             "text": name,
             "align": "center",
            }
          ]
        }
      });
   }
  var returnMessage = 
    {
    "type": "flex",
    "altText": "this is a flex message",
    "contents":{
      "type": "carousel",
      "contents": arrArea
      }
    }
  return returnMessage;
}

//2018/10/10 Can't send message because trucated server response
function PushMessage()
{
  var message = ReturnJSONFlexMessage;
  UrlFetchApp.fetch(line_push_url,
  {
    "hearder":{
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "method": "POST",
    "payload": JSON.stringify({
      //"to": "mememori1986",
      "messages" : [{
        "type": "text",
        "text": "tesst1"
      }]
    })
  })
}

function ReturnJSONFlexMessage()
{
  return [{
    "type": "flex",
    "altText": "this is a flex message",
    "contents":{
      "type": "carousel",
      "contents": [{
        "type": "bubble",
        "body": {
          "type":"box",
          "layout":"vertical",
          "contents":[
              {
                "type":"text",
                "text": "test1"
              }
            ]//contents
          }//body
          },
          {
          "type": "bubble",
          "body": {
          "type":"box",
          "layout":"vertical",
          "contents":[
             {
                "type":"text",
                "text": "test1",
              }
            ]
          }        
        }]
      }
  }]
}

function GetTrainDerayInformation()
{
 var url  = "https://rti-giken.jp/fhc/api/train_tetsudo/delay.json"
 var response = UrlFetchApp.fetch(url);
 var json = JSON.parse(response.getContentText());
 var jsonLength = Object.keys(json).length;
 var chienLine = "------------------";
 var arrChien = [{"type":"text","text":"遅延情報だよ～"}];
 for (var i=0;i<jsonLength;i++){
   chienLine　+= "\n" + json[i].name
 }
 arrChien.push({"type":"text","text":chienLine})
 return arrChien;
}
