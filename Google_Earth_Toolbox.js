/*
   -----------------------------------------------------------------------------
   On load
   -----------------------------------------------------------------------------
*/

CurDisplay = "homepage";
window.onload = function () {
    const DisplayNone = ['PathAndPolygon','CoordinateConversion','SingleToMultiple','Contact','Help'];
    //CombinePath

    for (const NavOptions of DisplayNone) {
        document.getElementById(NavOptions).style.display = "none";
    }
};

/*
   -----------------------------------------------------------------------------
   Navigation Bar & Current View
   -----------------------------------------------------------------------------
*/

var NavState = 0; //Starts closed, 1 if open
function Nav() {
    if (NavState == 0) {
        document.getElementById("mySidebar").style.width = "250px";
        document.getElementById("main").style.marginLeft = "250px";
        NavState = 1;
    } else {
        document.getElementById("mySidebar").style.width = "0px";
        document.getElementById("main").style.marginLeft = "0px";
        NavState = 0;
    }
}

function txt(NavOption) {
    document.getElementById(CurDisplay).style.display = "none";
    document.getElementById(NavOption).style.display = "block";
    CurDisplay = NavOption;
    Nav();
}

/*
   -----------------------------------------------------------------------------
   File Components
   -----------------------------------------------------------------------------
*/

function FileReact(id) {
    var GetFile = new FileReader();
    GetFile .onload=function(){
        document.getElementById(id+"_output").value= GetFile.result;
    }
    GetFile.readAsText(document.getElementById(id).files[0]);
}

function Download(Contents,Func) {
    Names_and_Coords(Contents,Func);
    let link = document.createElement('a');

    // Path to Polygon Tab
    if (Func == "pathtopolygon") {
        var NewContents = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom"><Document><name>'
        + Filename + '</name><Style id="sn_ylw-pushpin"><IconStyle><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/></IconStyle><LineStyle></LineStyle><PolyStyle><color>80ffffff</color></PolyStyle></Style><Style id="sh_ylw-pushpin"><IconStyle><scale>1.3</scale><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/></IconStyle><LineStyle></LineStyle><PolyStyle><color>80ffffff</color></PolyStyle></Style><StyleMap id="msn_ylw-pushpin"><Pair><key>normal</key><styleUrl>#sn_ylw-pushpin</styleUrl></Pair><Pair><key>highlight</key><styleUrl>#sh_ylw-pushpin</styleUrl></Pair></StyleMap><Placemark><name>'
        + Name + '</name><styleUrl>#msn_ylw-pushpin</styleUrl><Polygon><tessellate>1</tessellate><outerBoundaryIs><LinearRing><coordinates>'
        + Coordinates + '</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>';
        link.download = Filename+".kml";
    } if (Func == "polygontopath") {
        var NewContents = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom"><Document><name>'
        + Filename + '</name><Style id="s_ylw-pushpin"><IconStyle><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/></IconStyle></Style><StyleMap id="m_ylw-pushpin"><Pair><key>normal</key><styleUrl>#s_ylw-pushpin</styleUrl></Pair><Pair><key>highlight</key><styleUrl>#s_ylw-pushpin_hl</styleUrl></Pair></StyleMap><Style id="s_ylw-pushpin_hl"><IconStyle><scale>1.3</scale><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><hotSpot x="20" y="2" xunits="pixels" yunits="pixels"/></IconStyle></Style><Placemark><name>'
        + Name + '</name><styleUrl>#m_ylw-pushpin</styleUrl><LineString><tessellate>1</tessellate><coordinates>'
        + Coordinates + '</coordinates></LineString></Placemark></Document></kml>';
        link.download = Filename+".kml";
    }
    
    //Coordinate Conversion Tab
    
    if (Func == "coordinateconversion") {
        MapCoordinates = Coordinates.split('\n');
        if (SelectedCoord == "DMS"){
            DMS();
            var NewContents = FinalCoords;
        } else if (SelectedCoord == "DDM"){
            DDM();
            var NewContents = FinalCoords;
        } else if (SelectedCoord == "UTM"){
            UTM();
            var NewContents = FinalCoords;
        } else if (SelectedCoord == "MGS"){
            MGS();
            var NewContents = FinalCoords;
        } else {
            DD();
            var NewContents = FinalCoords;
        }
        link.download = Filename+"("+SelectedSyn+","+SelectedCoord+")"+".csv";
    }

    // Single to Multiple Tab

    if (Func == "singletomulti") {
        link.download = Filename + " - " + Name +".csv";
    }

    //General Download Code
    
    let blob = new Blob([NewContents], {type: 'text/plain'});
    
    link.href = URL.createObjectURL(blob);
    
    link.click();
    
    URL.revokeObjectURL(link.href);
}

function SimpleDownload(SimpleCont,SingleName) {
    zip.file(SingleName,SimpleCont);

    /*
    let link = document.createElement('a');

    link.download = SingleName + ".kml";

    let blob = new Blob([SimpleCont], {type: 'text/plain'});
    
    link.href = URL.createObjectURL(blob);
    
    link.click();
    
    URL.revokeObjectURL(link.href);
    */
}

/*
   -----------------------------------------------------------------------------
   Filtering Coordinates, Filename and name
   -----------------------------------------------------------------------------
*/

function Names_and_Coords(Contents,Func) {
    var Contents = Contents.replace(/(\r\n|\n|\r)/gm,"").replace(/\t/g, '');
    var Names = Contents.match(/<name>(.*?)<\/name>/g).map(function(val){
        return val.replace(/<\/?name>/g,'');
    });

    Names[0] = Names[0].replace(".kml","");
    Name = Names[1];

    if (Func == 'pathtopolygon') {
        Filename = Names[0] + " Polygon";
        First_Coords = Contents.match(/<coordinates>(.*?) /g)[0].replace('<coordinates>','').replace(' ','');
        Last_Coords = Contents.match(/ (.*?)<\/coordinates>/g)[0].replace('<\/coordinates>','').replace(' ','');
        if (First_Coords != Last_Coords) {
            Coordinates = Contents.match(/<coordinates>(.*?)<\/coordinates>/g)[0].replace(/<\/?coordinates>/g,'')+First_Coords;
        } else {
            Coordinates = Contents.match(/<coordinates>(.*?)<\/coordinates>/g)[0].replace(/<\/?coordinates>/g,'');
        }
    } if (Func == 'polygontopath') {
        Filename = Names[0] + " Path";
        Coordinates = Contents.match(/<coordinates>(.*?)<\/coordinates>/g)[0].replace(/<\/?coordinates>/g,'');
    } if (Func == 'coordinateconversion') {
        Filename = Names[0] + " Coordinates";
        Coordinates = Contents.match(/<coordinates>(.*?)<\/coordinates>/g)[0].replace(/<\/?coordinates>/g,'').trim().replaceAll(" ","\n");
    }
}


/*
   -----------------------------------------------------------------------------
   Radio Selected
   -----------------------------------------------------------------------------
*/

var SelectedSyn = 'Trad';
function isCheckedSyn(Radio) {
    SelectedSyn = Radio;
}

var SelectedCoord = 'DD';
function isCheckedCoord(Radio) {
    SelectedCoord = Radio;
}

/*
   -----------------------------------------------------------------------------
   Coordinate Conversion Functions
   -----------------------------------------------------------------------------
*/

function DMS(){
    if (SelectedSyn == "Trad") {
        FinalCoords = "Latitude,Longitude,Altitude\n";
        for (let i = 0; i < MapCoordinates.length; i++) {
            individual = MapCoordinates[i].split(",");
            AssDMS()
            FinalCoords +=  D2 + "&deg" + M2 + "'" + S2 + '"'+((individual[1]>=0) ? 'N' : 'S')+',' + D1 + "&deg" + M1 + "'" + S1 + '"'+((individual[0]>=0) ? 'E' : 'W')+',' + individual[2] + "\n";
        }
    } else {
        FinalCoords = ",Latitude,,,Longitude,,Altitude\nDegrees,Minutes,Seconds,Degrees,Minutes,Seconds,Meters\n";
        for (let i = 0; i < MapCoordinates.length; i++) {
            individual = MapCoordinates[i].split(",");
            AssDMS();
            FinalCoords +=  D2*individual[1]/Math.abs(individual[1]) + "," + M2 + "," + S2 + "," + D1*individual[0]/Math.abs(individual[0]) + "," + M1 + "," + S1 + "," + individual[2] + "\n";
        }
    }
}

function DDM(){
    if (SelectedSyn == "Trad") {
        FinalCoords = "Latitude,Longitude,Altitude\n";
        for (let i = 0; i < MapCoordinates.length; i++) {
            individual = MapCoordinates[i].split(",");
            AssDDM();
            FinalCoords +=  D2 + "&deg" + M2 + "'"+((individual[1]>=0) ? 'N' : 'S')+',' + D1 + "&deg" + M1 + "'"+((individual[0]>=0) ? 'E' : 'W')+',' + individual[2] + "\n";
        }
    } else {
        FinalCoords = "Latitude,,Longitude,,Altitude\nDegrees,Decimal Minutes,Degrees,Decimal Minutes,Meters\n";
        for (let i = 0; i < MapCoordinates.length; i++) {
            individual = MapCoordinates[i].split(",");
            AssDDM();
            FinalCoords +=  D2*individual[1]/Math.abs(individual[1]) + "," + M2 + "," + D1*individual[0]/Math.abs(individual[0]) + "," + M1 + "," + individual[2] + "\n";
        }
    }
}

function UTM(){

}

function MGS(){

}

function DD(){
    FinalCoords = "Latitude,Longitude,Altitude\n";
    for (let i = 0; i < MapCoordinates.length; i++) {
        individual = MapCoordinates[i].split(",");
        D1 = individual[0];
        D2 = individual[1];
        if (SelectedSyn == "Trad") {
            FinalCoords +=  D2 + "&deg," + D1 + "&deg," + individual[2] + "\n";
        } else {
            FinalCoords +=  D2 + "," + D1 + "," + individual[2] + "\n";
        }
    }
}

/*
   -----------------------------------------------------------------------------
   Assistant Coordinate Conversion Functions
   -----------------------------------------------------------------------------
*/

function AssDMS() {
    D1 = ~~(Math.abs(individual[0]));
    M1 = ~~((Math.abs(individual[0])-D1)*60);
    S1 = (Math.abs(individual[0])-D1-M1/60)*3600;
    D2 = ~~(Math.abs(individual[1]));
    M2 = ~~((Math.abs(individual[1])-D2)*60);
    S2 = ((Math.abs(individual[1])-D2-M2/60)*3600);
}

function AssDDM() {
    D1 = ~~(Math.abs(individual[0]));
    M1 = ((Math.abs(individual[0])-D1)*60);
    D2 = ~~(Math.abs(individual[1]));
    M2 = ((Math.abs(individual[1])-D2)*60);
}

/*
   -----------------------------------------------------------------------------
   Single to Multiple Functions
   -----------------------------------------------------------------------------
*/

function SingleToMultiple(AllContent) {
    Polygon_name = 1;
    Path_name = 1;
    Other_name = 1;
    zip = new JSZip();

    AllContent = AllContent.replace(/(\r\n|\n|\r)/gm,"").replace(/\t/g, '');
    Styles = AllContent.match(/<Style(.*?)<\/Style>/g);
    StyleID = [];

    for (let s = 0; s < Styles.length; s++) {
        StyleID.push(Styles[s].match(/id="(.*?)"/g)[0].replace('id="',"").replace('"',""));
    }

    Placemarks = AllContent.match(/<Placemark(.*?)<\/Placemark>/g);
    ShapeOrPoly = [];
    for (let p = 0; p < Placemarks.length; p++) {
        if (Placemarks[p].match(/<Polygon(.*?)>/g) || Placemarks[p].match(/<LineString(.*?)>/g)) {
            ShapeOrPoly.push(Placemarks[p]);
            AllContent = AllContent.replace(Placemarks[p],"")
        }
    }

    Folders = AllContent.match(/<Folder(.*?)<\/Folder>/g);
    for (let f = 0; f < Folders.length; f++) {
        if (Folders[f].match(/<coordinates(.*?)>/g) == null) {
            AllContent = AllContent.replace(Folders[f],"")
        }
    }

    var Names = AllContent.match(/<name>(.*?)<\/name>/g)[0].replace(/<\/?name>/g,'');
    SimpleDownload(AllContent,Names.replace(".kml","").replace(".kmz","")+".kml");
    
    start = AllContent.match(/(.*?)<Document>/g)[0];
    end = "</Document></kml>"

    for (let sop = 0; sop < ShapeOrPoly.length; sop++) {
        NewContents = start;
        StyleUrl = ShapeOrPoly[sop].match(/<styleUrl>#(.*?)<\/styleUrl>/g);
        for (let url = 0; url < StyleUrl.length; url++) {
            AddStyle = StyleUrl[url].replace("<styleUrl>#",'').replace("<\/styleUrl>",'');
            NewContents += Styles[StyleID.indexOf(AddStyle)];
        }

        try {
            var Names = ShapeOrPoly[sop].match(/<name>(.*?)<\/name>/g)[0].replace(/<\/?name>/g,'');
        } catch {
            if (ShapeOrPoly[sop].match(/<Polygon(.*?)>/g)) {
                var Names = "Polygon " + Polygon_name;
                Polygon_name += 1;
            } else if (ShapeOrPoly[sop].match(/<LineString(.*?)>/g)) {
                var Names = "Path " + Path_name;
                Path_name += 1;
            } else {
                var Names = "Unknown " + Other_name;
                Other_name += 1;
            }
        }
        Names = Names.replace(".kml","").replace(".kmz","") + ".kml"
        NewContents += "<name>"+Names+".kml</name>"+ ShapeOrPoly[sop] + end;
        SimpleDownload(NewContents,Names);
    }

    zip.generateAsync({type:"blob"})
    .then(function(content) {
        saveAs(content, "The Google Earth Toolbox.zip");
    });
}