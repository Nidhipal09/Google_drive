(function () {
    let header = document.querySelector("#header")

    let addFolderBtn = document.querySelector("#addFolder")
    let addTextFileBtn = document.querySelector("#addTextFile")

    let container = document.querySelector("#container")
    let myTemplate = document.querySelector("#myTemplate")
    let breadcrumb = document.querySelector("#breadcrumb")
    let aRootPath = document.querySelector(".path")

    let app = document.querySelector("#app")
    let appTitleBar = document.querySelector("#app-title-bar")
    let appTitle = document.querySelector("#app-title")
    let appMenuBar = document.querySelector("#app-menu-bar")
    let appBody = document.querySelector("#app-body")

    let rid = 0 // folder id
    let res = []  // resources
    let cfid = -1 // id of the folder in which we are right now

    addFolderBtn.addEventListener("click", addFolder)
    addTextFileBtn.addEventListener("click", addTextFile)
    aRootPath.addEventListener("click", navigateBreadCrumb)


    //folders
    function addFolder() {
        let fname = prompt("Enter folder name")
        if (!!fname) {
            let ridx = -1
            ridx = res.findIndex(f => f.name == fname)
            if (ridx == -1) {
                rid++
                addFolderInPage(fname, rid, cfid)
                res.push({
                    id: rid,
                    name: fname,
                    pid: cfid,
                    rtype: "folder"
                })
                persistresToStorage()
            }
            else {
                alert(fname + " already exists.")
            }
        }


    }

    function addFolderInPage(fname, rid, pid) {

        let templeteFolder = myTemplate.content.querySelector(".folder")
        let divFile = document.importNode(templeteFolder, true)  //true for copying templateFolder's children also

        let NameDiv = divFile.querySelector("[for='name']")
        let deleteSpan = divFile.querySelector("[action='delete']")
        let editSpan = divFile.querySelector("[action='edit']")
        let viewSpan = divFile.querySelector("[action='view']")

        NameDiv.innerHTML = fname
        divFile.setAttribute("rid", rid)
        divFile.setAttribute("pid", pid)

        deleteSpan.addEventListener("click", deletefolder)
        editSpan.addEventListener("click", editFolder)
        viewSpan.addEventListener("click", viewFolder)

        container.appendChild(divFile)

        console.log(res)

    }
    
    function deletefolder() {
        let divFile = this.parentNode
        let NameDiv = divFile.querySelector("[for='name']")
        let rrid = parseInt(divFile.getAttribute("rid"))  // folder id to be removed
        let flag = confirm("Are you sure to delete " + '"' + NameDiv.innerHTML + '"')  // come back to this code when u are done with closure
        if (flag) {

            let childrenExists = res.some(f => f.pid == rrid)
            if (!childrenExists) {
                container.removeChild(divFile)
                let idx = res.findIndex(f => f.id == rrid)  // why not using rid in place of removedId
                res.splice(idx, 1)
                console.log(res)
                persistresToStorage()
            }
            else alert(NameDiv.innerHTML + " Folder can't be delete. It has children.")

        }
    }

    function editFolder() {
        let divFile = this.parentNode
        let NameDiv = divFile.querySelector("[for='name']")
        let ofname = NameDiv.innerHTML

        let newFname = prompt("Enter new folder name ")
        if (!!newFname) {
            if (newFname != ofname) {
                let exists = res.some(f => f.name == newFname && f.pid == cfid)
                if (!exists) {
                    let divName = divFile.querySelector("[for='name']")
                    divName.innerHTML = newFname
                    let editedId = divFile.getAttribute("rid")

                    let f = res.find(f => f.id == editedId)  // why not using rid in place of editedId
                    f.name = newFname

                    console.log(res)
                    persistresToStorage()
                }
                else {
                    alert(newFname + " already exists.")
                }

            }

        }
    }

    function viewFolder() {
        let divFile = this.parentNode
        let divName = divFile.querySelector("[for='name']")
        let rid = parseInt(divFile.getAttribute("rid"))
        cfid = rid

        let apathTemplate = myTemplate.content.querySelector(".path")
        let apath = document.importNode(apathTemplate, true)

        apath.innerHTML = divName.innerHTML
        apath.setAttribute("rid", cfid)

        breadcrumb.appendChild(apath)

        apath.setAttribute("pid", divFile.getAttribute("pid"))

        apath.addEventListener("click", navigateBreadCrumb)

        container.innerHTML = ""
        res.filter(f => f.pid == cfid).forEach(f => {
            if (f.rtype == "folder") addFolderInPage(f.name, f.id, f.pid)
            else if (f.rtype == "textFile") addTextFileInPage(f.name, f.id, f.pid)
            else if (f.rtype == "album") addAlbumInPage(f.name, f.id, f.pid)
        })
    }
    

    //navigation
    function navigateBreadCrumb() {
        console.log(this.getAttribute("pid") + " " + this.innerHTML + " " + this.getAttribute("rid"))
        let fname = this.innerHTML
        let rid = parseInt(this.getAttribute("rid"))
        cfid = rid

        container.innerHTML = ""
        res.filter(f => f.pid == cfid).forEach(f => {
            if (f.rtype == "folder") addFolderInPage(f.name, f.id, f.pid)
            else if (f.rtype == "textFile") addTextFileInPage(f.name, f.id, f.pid)
            else if (f.rtype == "album") addAlbumInPage(f.name, f.id, f.pid)
        })

        while (this.nextSibling) {
            this.parentNode.removeChild(this.nextSibling)
        }
    }


    //storage
    function persistresToStorage() {
        let fjson = JSON.stringify(res)
        localStorage.setItem("resData", fjson)
        console.log(fjson)
    }

    function loadFolderFromStorage() {
        let fjson = localStorage.getItem("resData")
        if (!!fjson) {
            res = JSON.parse(fjson)
            let maxId = 0
            res.forEach(function (f) {
                if (f.pid == cfid && f.rtype == "folder") addFolderInPage(f.name, f.id, f.pid)
                else if (f.pid == cfid && f.rtype == "textFile") addTextFileInPage(f.name, f.id, f.pid)
                else if (f.pid == cfid && f.rtype == "album") addAlbumInPage(f.name, f.id, f.pid)
                if (f.id > maxId) maxId = f.id
            })
            rid = maxId
        }
    }

    loadFolderFromStorage()


    //Text file
    function addTextFile() {
        let fname = prompt("Enter text-file name")
        if (!!fname) {
            let exists = res.some(f => f.name == fname && f.pid == cfid)
            if (!exists) {
                rid++
                addTextFileInPage(fname, rid, cfid)
                res.push({
                    id: rid,
                    name: fname,
                    pid: cfid,
                    rtype: "textFile",
                    isBold: false,
                    isItalic: false,
                    isUnderline: false,
                    bgColor: "white",
                    fgColor: "black",
                    fontFamily: "serif",
                    fontSize: 32
                })
                persistresToStorage()
            }
            else {
                alert(fname + " already exists.")
            }
        }


    }

    function addTextFileInPage(fname, rid, pid) {

        let templeteTextFile = myTemplate.content.querySelector(".textFile")
        let divTextFile = document.importNode(templeteTextFile, true)  //true for copying templateFolder's children also

        let NameDiv = divTextFile.querySelector("[for='name']")
        let deleteSpan = divTextFile.querySelector("[action='delete']")
        let editSpan = divTextFile.querySelector("[action='edit']")
        let viewSpan = divTextFile.querySelector("[action='view']")

        NameDiv.innerHTML = fname
        divTextFile.setAttribute("rid", rid)
        divTextFile.setAttribute("pid", pid)

        deleteSpan.addEventListener("click", deleteTextFile)
        editSpan.addEventListener("click", editTextFile)
        viewSpan.addEventListener("click", viewTextFile)

        container.appendChild(divTextFile)

        console.log(res)

    }

    function deleteTextFile() {
        let divFile = this.parentNode
        let NameDiv = divFile.querySelector("[for='name']")
        let rrid = parseInt(divFile.getAttribute("rid"))  // file id to be removed
        let flag = confirm("Are you sure to delete " + '"' + NameDiv.innerHTML + '"')  // come back to this code when u are done with closure
        if (flag) {
            container.removeChild(divFile)
            let idx = res.findIndex(f => f.id == rrid)  // why not using rid in place of removedId
            res.splice(idx, 1)
            console.log(res)
            persistresToStorage()
        }
    }

    function editTextFile() {
        let divFile = this.parentNode
        let NameDiv = divFile.querySelector("[for='name']")
        let ofname = NameDiv.innerHTML

        let newFname = prompt("Enter new file name ")
        if (!!newFname) {
            if (newFname != ofname) {
                let exists = res.some(f => f.name == newFname && f.pid == cfid)
                if (!exists) {
                    let divName = divFile.querySelector("[for='name']")
                    divName.innerHTML = newFname
                    let editedId = divFile.getAttribute("rid")

                    let f = res.find(f => f.id == editedId)  // why not using rid in place of editedId
                    f.name = newFname

                    console.log(res)
                    persistresToStorage()
                }
                else {
                    alert(newFname + " already exists.")
                }

            }

        }
    }

    function viewTextFile() {
        app.style.display = "block"

        let templateNotepadMenu = myTemplate.content.querySelector(".notepad-menu")
        let templateNotepadBody = myTemplate.content.querySelector(".notepad-body")

        let divNotepadMenu = document.importNode(templateNotepadMenu, true)
        let divNotepadBody = document.importNode(templateNotepadBody, true)

        appMenuBar.innerHTML = ""
        appMenuBar.appendChild(divNotepadMenu)

        appBody.innerHTML = ""
        appBody.appendChild(divNotepadBody)

        let spanView = this
        let divTextFile = spanView.parentNode
        let divName = divTextFile.querySelector("[for='name']")
        let fname = divName.innerHTML
        let fid = parseInt(divTextFile.getAttribute("rid"))

        appTitle.innerHTML = fname
        appTitle.setAttribute("rid", fid)

        let spanSave = appMenuBar.querySelector("[action='save']")
        let spanBold = appMenuBar.querySelector("[action='bold']")
        let spanItalic = appMenuBar.querySelector("[action='italic']")
        let spanUnderline = appMenuBar.querySelector("[action='underline']")
        let inputBgcolor = appMenuBar.querySelector("[action='bg-color']")
        let inputFgcolor = appMenuBar.querySelector("[action='fg-color']")
        let selectFontFamily = appMenuBar.querySelector("[action='font-family']")
        let selectFontSize = appMenuBar.querySelector("[action='font-size']")
        let spanDownload = appMenuBar.querySelector("[action='download']")
        let spanForUpload = appMenuBar.querySelector("[action='forUpload']")
        let inputUpload = appMenuBar.querySelector("[action='upload']")
        let textarea = appBody.querySelector("textarea")

        let f = res.find(f => f.id == fid)
        spanBold.setAttribute("pressed", !f.isBold)
        spanItalic.setAttribute("pressed", !f.isItalic)
        spanUnderline.setAttribute("pressed", !f.isUnderline)
        inputBgcolor.value = f.bgColor
        inputFgcolor.value = f.fgColor
        selectFontFamily.value = f.fontFamily
        selectFontSize.value = f.fontSize
        textarea.value = f.content == undefined ? "" : f.content

        spanSave.addEventListener("click", saveTextFile)
        spanBold.addEventListener("click", makeTextFileBold)
        spanItalic.addEventListener("click", makeTextFileItalic)
        spanUnderline.addEventListener("click", makeTextFileUnderline)
        inputBgcolor.addEventListener("change", changeTextFileBgColor)
        inputFgcolor.addEventListener("change", changeTextFileFgColor)
        selectFontFamily.addEventListener("change", changeTextFileFontFamily)
        selectFontSize.addEventListener("change", changeTextFileFontSize)
        spanDownload.addEventListener("click", downloadTextFile)
        inputUpload.addEventListener("change", uploadTextFile)
        spanForUpload.addEventListener("click", function () {
            inputUpload.click()
        })

        spanBold.dispatchEvent(new Event("click"))
        spanItalic.dispatchEvent(new Event("click"))
        spanUnderline.dispatchEvent(new Event("click"))
        inputBgcolor.dispatchEvent(new Event("change"))
        inputFgcolor.dispatchEvent(new Event("change"))
        selectFontFamily.dispatchEvent(new Event("change"))
        selectFontSize.dispatchEvent(new Event("change"))

        
        let closeNotepad = appTitleBar.querySelector("[action='close']")
        closeNotepad.addEventListener("click", function(){
            app.style.display = "none"
        })

        let maximizeNotepad = appTitleBar.querySelector("[action='maximize']")
        maximizeNotepad.addEventListener("click", function(){
            header.style.display = "none"
            breadcrumb.style.display = "none"
            container.style.display = "none"

            app.style.height = "550px"
            let textarea = appBody.querySelector("textarea")
            appBody.style.height = "100%"
            textarea.style.height = "100%"
        })

        let minimizeNotepad = appTitleBar.querySelector("[action='minimize']")
        minimizeNotepad.addEventListener("click", function(){
            header.style.display = "block"
            breadcrumb.style.display = "block"
            container.style.display = "flex"

            app.style.height = "270px"            
        })
    }


    function saveTextFile() {
        let rfile = res.find(f => f.name == appTitle.innerHTML)

        let spanBold = appMenuBar.querySelector("[action='bold']")
        let spanItalic = appMenuBar.querySelector("[action='italic']")
        let spanUnderline = appMenuBar.querySelector("[action='underline']")
        let inputBgcolor = appMenuBar.querySelector("[action='bg-color']")
        let inputFgcolor = appMenuBar.querySelector("[action='fg-color']")
        let selectFontFamily = appMenuBar.querySelector("[action='font-family']")
        let selectFontSize = appMenuBar.querySelector("[action='font-size']")

        rfile.content = appBody.querySelector("textarea").value
        rfile.isBold = spanBold.getAttribute("pressed") == "true"
        rfile.isItalic = spanItalic.getAttribute("pressed") == "true"
        rfile.isUnderline = spanUnderline.getAttribute("pressed") == "true"
        rfile.bgColor = inputBgcolor.value
        rfile.fgColor = inputFgcolor.value
        rfile.fontFamily = selectFontFamily.value
        rfile.fontSize = selectFontSize.value

        persistresToStorage()


    }


    //notepad menu

    function makeTextFileBold() {
        let pressed = this.getAttribute("pressed") == "true"
        let textArea = appBody.querySelector("textarea")
        if (pressed == true) {
            this.setAttribute("pressed", false)
            textArea.style.fontWeight = "normal"
        } else {
            this.setAttribute("pressed", true)
            textArea.style.fontWeight = "bold"
        }
    }

    function makeTextFileItalic() {
        let pressed = this.getAttribute("pressed") == "true"
        let textArea = appBody.querySelector("textarea")
        if (pressed == true) {
            this.setAttribute("pressed", false)
            textArea.style.fontStyle = "normal"
        } else {
            this.setAttribute("pressed", true)
            textArea.style.fontStyle = "italic"
        }

    }

    function makeTextFileUnderline() {
        let pressed = this.getAttribute("pressed") == "true"
        let textArea = appBody.querySelector("textarea")
        if (pressed == true) {
            this.setAttribute("pressed", false)
            textArea.style.textDecoration = "none"
        } else {
            this.setAttribute("pressed", true)
            textArea.style.textDecoration = "underline"
        }

    }

    function changeTextFileBgColor() {
        let color = this.value
        let textArea = appBody.querySelector("textarea")
        textArea.style.backgroundColor = color
    }

    function changeTextFileFgColor() {
        let color = this.value
        let textArea = appBody.querySelector("textarea")
        textArea.style.color = color
    }

    function changeTextFileFontFamily() {
        let fontName = this.value
        let textArea = appBody.querySelector("textarea")
        textArea.style.fontFamily = fontName
    }

    function changeTextFileFontSize() {
        let fontSize = this.value
        let textArea = appBody.querySelector("textarea")
        textArea.style.fontSize = fontSize
    }

    function downloadTextFile() {
        let fid = parseInt(appTitle.getAttribute("rid"))
        let f = res.find(f => f.id == fid)

        let appMenuBar = this.parentNode
        let aDownload = appMenuBar.querySelector("a[for='download']")

        let encodedData = encodeURIComponent(JSON.stringify(f))

        aDownload.setAttribute("href", "data:, " + encodedData)
        aDownload.setAttribute("download", f.name + ".json")

        aDownload.click()
    }

    function uploadTextFile() {
        let file = window.event.target.files[0]

        let reader = new FileReader()
        reader.addEventListener("load", function () {
            let data = window.event.target.result
            let f = JSON.parse(data)
            console.log(f)

            let spanBold = appMenuBar.querySelector("[action='bold']")
            let spanItalic = appMenuBar.querySelector("[action='italic']")
            let spanUnderline = appMenuBar.querySelector("[action='underline']")
            let inputBgcolor = appMenuBar.querySelector("[action='bg-color']")
            let inputFgcolor = appMenuBar.querySelector("[action='fg-color']")
            let selectFontFamily = appMenuBar.querySelector("[action='font-family']")
            let selectFontSize = appMenuBar.querySelector("[action='font-size']")

            spanBold.setAttribute("pressed", !f.isBold)
            spanItalic.setAttribute("pressed", !f.isItalic)
            spanUnderline.setAttribute("pressed", !f.isUnderline)
            inputBgcolor.value = f.bgColor
            inputFgcolor.value = f.fgColor
            selectFontFamily.value = f.fontFamily
            selectFontSize.value = f.fontSize

            spanBold.dispatchEvent(new Event("click"))
            spanItalic.dispatchEvent(new Event("click"))
            spanUnderline.dispatchEvent(new Event("click"))
            inputBgcolor.dispatchEvent(new Event("change"))
            inputFgcolor.dispatchEvent(new Event("change"))
            selectFontFamily.dispatchEvent(new Event("change"))
            selectFontSize.dispatchEvent(new Event("change"))
        })
        reader.readAsText(file)
    }

    

   

})()
