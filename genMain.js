genExtra = function(d){ //Gen extra attributes such as src, onclick
    var extra = ''
    //console.log(d)
    for(var istr in ai2ext.Extra){
        //console.log(istr in d)
        if(istr in d){
            //console.log(istr)
            //console.log(d[istr])
            if(typeof ai2ext.Extra[istr].value!='string'){
                extra += ai2ext.Extra[istr].id + ai2ext.Extra[istr].value[d[istr]] + ' '
            }
            else{
                extra += ai2ext.Extra[istr].id + d[istr] + ai2ext.Extra[istr].value + ' '
            }
        }
    }
    return extra
}

getStyle = function(d){ //d = component json data
    /*
        TODO Replace all the in statement with a loop
        which loop through all the keys
        and match them with the json file.
        (Only one 'in' statement is required)
        /\ /\Already Done/\ /\
        Note that is may or may not be the best method
        and is subject to change
    */
    var style = ''

    if((d.$Type == 'HorizontalScrollArrangement') || (d.$Type == 'HorizontalArrangement')){
        style = 'display:inline-flex;'
    }
    if((d.$Type == 'VerticalScrollArrangement') || (d.$Type == 'VerticalArrangement')){
        style = 'display:block;'
    }

    //console.log(d)
    for(var istr in ai2sty.Style){
        //console.log(istr in d)
        if(istr in d){
            //console.log(istr)
            //console.log(d.TextAlignment)
            //console.log(d[istr])
            if(typeof ai2sty.Style[istr].value!='string'){
                style += ai2sty.Style[istr].id + ai2sty.Style[istr].value[d[istr]] + ';'
            }
            else{
                if(ai2sty.Style[istr].isColorHex) {
                    style += ai2sty.Style[istr].id + d[istr].replace("&HFF", "#") + ai2sty.Style[istr].value + ';'
                } else {
                style += ai2sty.Style[istr].id + d[istr] + ai2sty.Style[istr].value + ';'
                }
            }
        }
    }



    //No Style Check
    if(style != ''){
        style = 'style="' + style + '"';
    }
    return style
}

/**
 * Convert the ai2 object to a HTML Element 
 * @param {JSON} d  - the ai2 JSON  
 */
function getElement(d){ //TODO Change these to reference json file for dict on converting
    checkLog(d)
    if(d.$Type in ai2cmp.Tag){
        //console.log(d.$Type)
        //console.log('is it' + d.$Type == 'HorizontalScrollArrangement')
        if(d.Text === undefined){
            if((d.$Type == 'HorizontalScrollArrangement') || (d.$Type == 'HorizontalArrangement') || (d.$Type == 'VerticalScrollArrangement') || (d.$Type == 'VerticalArrangement')){
                //console.log(d.$Components)
                var innerContent = ""
                for(var j=0;j<d.$Components.length;j++){
                    innerContent += getElement(d.$Components[j]) //CONVERT PROCEDURE
                }
                return '<' + 'div' + ' id="' + d.$Name + '" ' + getStyle(d) + genExtra(d) + '>'
                    + innerContent + '</' + 'div' +'>\n<br>';
            }
            else{
            return '<' + ai2cmp.Tag[d.$Type] + ' id="' + d.$Name + '" ' + getStyle(d) + genExtra(d) + '>'
                + '</' + ai2cmp.Tag[d.$Type] +'>\n<br>';
            }
        }
        else{
            return '<' + ai2cmp.Tag[d.$Type] + ' id="' + d.$Name + '" ' + getStyle(d) + genExtra(d) + '>'
                + d.Text + '</' + ai2cmp.Tag[d.$Type] +'>\n<br>';
        }
    }
    else{
        return ''
    }
    
}

/**
 * Returns the HTML codes from the JSON codes in the .scm file
 * @param {JSON} obj - The JSON object to be converted
 */
function jsonToHTML(obj){
    var hcode = "";
    hcode = '<html><head><meta charset="UTF-8"><title>'
            + obj.AppName + '/' + obj.$Name
            + '</title></head>\n<body>\n<div style="">'
    console.log(obj)
    for(var i=0;i<obj.$Components.length;i++){
        try{
            hcode += getElement(obj.$Components[i]) //CONVERT PROCEDURE
        }
        catch(ierr){
            console.log("ERROR WHILE CONVERTING: " + ierr)
            document.getElementById("logs").innerHTML += "<label style='color:red'>ERROR WHILE CONVERTING "
                + obj.$Components[i] + ":" + ierr + "</label><br>"
        }
    }
    hcode += '</div></body></html>'
    //console.log(hcode)
    document.getElementById('prev').innerHTML = hcode
    var htmlDoc = null
    var htmlDatas = new Blob([hcode], {type: 'text/plain'});
    if (hcode !== null) {
        window.URL.revokeObjectURL(htmlDoc);
    }
    document.getElementById("save").innerHTML = "<a style='font-size:30vm'"
        + " href=\"" + window.URL.createObjectURL(htmlDatas)
        + "\" download='" + obj.$Name + ".html'>Download HTML File</a>";
}


/**
 * Returns the HTML code from a .scm file
 * @param {FileReader} scmfile - The .scm file 
 */
function scmToHTML(scmfile){
    var tScm = scmfile.split("\n");
    try{
        scn = JSON.parse(tScm[2]);
        console.log(scn);
        jsonToHTML(scn.Properties)
    }
    catch(err){
        console.log("APPLICATION ERROR:" + err)
        document.getElementById("logs").innerHTML += "<label style='color:red'>APPLICATION ERROR: " + err + "\nEnding process...</label><br>"
    }
}


var scn;
    document.getElementById("cFile").addEventListener("change",function(e){
        var f = new FileReader();
        
        f.onload = function(){
            //console.log("fbh");
            var tScm = f.result.split("\n");
            try{
                scn = JSON.parse(tScm[2]);
                console.log(scn);
                jsonToHTML(scn.Properties)
            }
            catch(err){
                console.log("APPLICATION ERROR:" + err)
                document.getElementById("logs").innerHTML += "<label style='color:red'>APPLICATION ERROR: " + err + "\nEnding process...</label><br>"
            }
            
        }
        f.readAsText(e.target.files[0]);
    });