var url = require('url') ;
var request = require('request');
var ajax = require('ajax-request');
var cheerio = require('cheerio');
var Krawler = require('krawler');
var http = require('http');
var fs = require('fs');





var downloadDatasheet = function (collection  , num  ,name  ) {
    console.log("Downloading ... " ) ;
    if (Number(num)) {
        s = 1 ;
        for (var ic in collection) {
            if (s == num){
                ajax.download(
                    {rootPath : __dirname, url :"http://www.nxp.com"  + collection[ic] ,destPath : __dirname + "/downloadedFiles/" + name + "/" + ic + ".pdf" } ,
                function(err, res, body, filepath) {
                    console.log("Downloading " + ic + " to " + filepath);
                    runApp() ;
                    return ;
                }
            )
            }
            s++ ;
        }

    }
    else {
        for (var ic in collection) {
            ajax.download(
                {rootPath : __dirname, url :"http://www.nxp.com"  + collection[ic] ,destPath : __dirname + "/downloadedFiles/" + name + "/" + ic + ".pdf" } ,
                function(err, res, body, filepath) {
//                    console.log("Downloading " + ic + " to " + filepath);

                }
            )
        }
        console.log("Downloding fies . might take a short while :) ")
        runApp() ;
        return ;
    }

}
console.log("############### DIGITAL CIRCUIT IC SCRAPER ###############") ;
console.log("##########################################################") ;
console.log("")
var runApp = function() {
    console.log("OPTIONS : ")
    console.log("1) Search") ;
    console.log("2) Quit") ;
        var prompt = require('prompt');
        prompt.start();
        prompt.get(['Option'], function (err, result) {
            if (result.Option == 1 ) {
                prompt.start()
                console.log("Enter the Ic name you are looking for , and the number of results  : ")
                var seacrchKey = "" ;
                prompt.get(["icName" , "count"] , function (err, result) {
                    console.log("Scraping data sheet .. ") ;
                    seacrchKey = result.icName ;
                    var krawler = new Krawler ;
                    var count = result.count || 10  ;
                    var dataSheets = {  }
                    var link = [ "http://www.nxp.com/search?pcon%5B%5D=Data+sheet&rows=" + result.count.toString() + "&type=keyword&q=" + result.icName.replace(" " , "+") + "&page=1&tab=Documents&filterChanged=pcon%5B%5D" ]
                    krawler.queue(link)
                        .on('data' , function ($, url, resp) {
                            $('table.standard tbody tr').each(function () {
                                if ($(this).children('td').children('a').text() in dataSheets ) {
                                    var duplacte = 0 ;
                                    for (var name in dataSheets) {
                                        if ( name ==$(this).children('td').children('a').text() ) {duplacte ++ ;}
                                    }
                                    dataSheets[$(this).children('td').children('a').text() +"_" + duplacte.toString()] = $(this).children('td').children('a').attr('href') ;
                                }
                                else {
                                    dataSheets[$(this).children('td').children('a').text()] = $(this).children('td').children('a').attr('href') ;
                                }

                            })
                        })
                        .on('error', function(err, url) {
                            console.log(err) ;
                        })
                        .on('end' , function () {
                            console.log("Scraping finished .");
                            console.log("RESULTS :: ")
                            var c = 1 ;
                            for (var i in dataSheets) {
                                console.log(c.toString() + ") " + i ) ;
                                c ++ ;
                            }
                            console.log("==> Enter the number of the gate that you want to download , enter 0 to download all ") ;
                            prompt.start() ;
                            prompt.get(["Index"] , function (err, result) {
                                downloadDatasheet(dataSheets , result.Index , seacrchKey) ;
                            })
                        })

                })
            }
            else {
                process.exit() ;
            }
        }) ;
}

runApp()