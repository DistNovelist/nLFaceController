/*!
 * Copyright(c) Live2D Inc. All rights reserved.
 * Licensed under the MIT License.
 * https://opensource.org/license/mit/
 */

const nLPlugin = new NLPlugin("顔ス コントローラー")
nLPlugin.developer = "Polta Karakuri"
nLPlugin.version = "1.0.0"
nLPlugin.token = localStorage.getItem("token")
// nLPlugin.debug = true

function connect() {
    if (nLPlugin.state === NLPlugin.CLOSED) {
        nLPlugin.start(url.value)
    } else {
        nLPlugin.stop()
    }
}

nLPlugin.onStateChanged = (state) => {
    switch (state) {
        case NLPlugin.CLOSED:
            document.getElementById("state").textContent = "Closed"
            break
        case NLPlugin.CONNECTING:
            document.getElementById("state").textContent = "Connecting"
            break
        case NLPlugin.OPEN:
            document.getElementById("state").textContent = "Open"
            break
        case NLPlugin.ESTABLISHED:
            document.getElementById("state").textContent = "Established"
            // Token の保存
            if (!location.href.startsWith("file://"))
                localStorage.setItem("token", nLPlugin.token)
            break
        case NLPlugin.AVAILABLE:
            document.getElementById("state").textContent = "Available"
            break
    }
    if (state === NLPlugin.AVAILABLE) {
        nLPlugin.callMethod("NotifyFrameUpdated", { "Enabled": true })
        nLPlugin.callMethod("NotifyCurrentModelChanged", { "Enabled": true })
        nLPlugin.callMethod("GetCurrentModelId").then(setCurrentModel)
    } else {
        document.getElementById("modelId").textContent = ""
    }
}

nLPlugin.addEventListener("NotifyFrameUpdated", setParameterValues)
nLPlugin.addEventListener("NotifyCurrentModelChanged", setCurrentModel)

let modelId = ""

function setCurrentModel(message) {
    modelId = message.Data.ModelId
    document.getElementById("modelId").textContent = modelId
    nLPlugin.callMethod("GetLiveParameters", {}).then(setLiveParameters)
    nLPlugin.callMethod("GetCubismParameters", { "ModelId": modelId }).then(setCubismParameters)
}

var liveParams = {};
var cubismParams = {};
var keyVals = {};
// apiから取得したルールデータ
var rules = [];
var sendflag = true;
function setLiveParameters(message) {
    // liveParams = message.Data.LiveParameters;
    liveParams = {};
    for (let param of message.Data.LiveParameters) {
        liveParams[param.Id] = param.Value;
    }
    setRules();
}

function setCubismParameters(message) {
    // cubismParams = message.Data.CubismParameters;
    cubismParams = {};
    for (let param of message.Data.CubismParameters) {
        cubismParams[param.Id] = param.Value;
    }
    setRules();
}

function setParameterValues(message) {
    for (let model of message.Data.Models) {
        if (model.ModelId !== modelId) continue
        for (let param of model.LiveParameterValues) {
            liveParams[param.Id] = param.Value;
        }
        for (let param of model.CubismParameterValues) {
            cubismParams[param.Id] = param.Value;
        }
    }
    updateKeyVals();
}

function updateKeyVals() {
    if(!sendflag){
        return;
    }
    for (let rule in rules) {
        var param = rules[rule]["param"];
        var min = parseFloat(rules[rule]["min"]);
        var max = parseFloat(rules[rule]["max"]);
        var key = rules[rule]["key"];
        var val = 0;
        if (param in liveParams) {
            val = liveParams[param];
        }else if (param in cubismParams) {
            val = cubismParams[param];
        }
        newKeyVal = (min <= val && val <= max);
        if(newKeyVal!=keyVals[key]){
            keyVals[key] = newKeyVal;
            $.ajax({
                url: '/api/key',
                type: 'POST',
                data: {key:key, val:newKeyVal},
                dataType: 'json',
                async: false
            });
        }
    }
}

function saveRules(){
    var newRules = [];
    var idx = 0;
    $(".param").each(function(){
        var param = $(this).val();
        var min = $(this).parent().parent().find(".min").val();
        var max = $(this).parent().parent().find(".max").val();
        var key = $(this).parent().parent().find(".key").val();
        newRules.push({"param": param, "min": min, "max": max, "key": key});
        idx++;
    });
    rules = newRules;
    $.ajax({
        url: '/api/saveRules',
        type: 'POST',
        data: {rules:rules},
        dataType: 'json',
        async: false
    });
    setRules();
}

function setRules(load = false){
    // ルールデータを取得
    if(load){
        rules = $.ajax({
            url: '/api/getRules',
            type: 'GET',
            dataType: 'json',
            async: false
        }).responseJSON;
    }
    // ルールデータを表示
    var table = $("#rulesTable");
    table.empty();
    for (let rule of rules) {
            var row = table.append("<tr><td><input type='checkbox' class='sel'></td><td><select class='param' value='"+ rule["param"] +"'><option value='" + rule["param"] + "'>" + rule["param"] + "</option></select></td><td><input type='number' class='min' value='" + rule["min"] + "'></input></td><td><input type='number' class='max' value='" + rule["max"] + "'></input></td><td><input type='text' class='key' value='" + rule["key"] + "'></input></td></tr>");
    }
    // パラメータの選択肢を設定
    var params = Object.keys(liveParams).concat(Object.keys(cubismParams));
    if(params.length == 0){
        return;
    }
    var idx = 0;
    $(".param").each(function(){
        var select = $(this);
        select.empty();
        for (let param of params) {
            select.append("<option value='" + param + "'>" + param + "</option>");
        }
        select.val(rules[idx]["param"]);
        $(this).on('change', saveRules);
        $(this).parent().parent().find(".min").on('change', saveRules);
        $(this).parent().parent().find(".max").on('change', saveRules);
        $(this).parent().parent().find(".key").on('change', saveRules);
        idx++;
    });
}

function addRule(){
    rules.push({"param": "", "min": 0, "max": 1, "key": ""});
    setRules();
}

function delRule(){
    $(".sel").each(function(){
        if($(this).prop('checked')){
            var idx = $(this).parent().parent().index();
            rules.splice(idx, 1);
        }
    });
    setRules();
}

function clearInput(){
    $.ajax({
        url: '/api/key',
        type: 'POST',
        data: {key:'clear', val:true},
        dataType: 'json',
        async: false
    });
}

function pause(){
    sendflag = !sendflag;
    if(sendflag){
        $("#pause").text("Pause");
    }else{
        $("#pause").text("Resume");
    }
}

$(function(){
    setRules(true);
});