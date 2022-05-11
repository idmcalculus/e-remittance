const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const officeTypes = {
	"msword": "doc",
	"msword": "dot",
	"vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
	"vnd.openxmlformats-officedocument.wordprocessingml.template": "dotx",
	"vnd.ms-word.document.macroEnabled.12": "docm",
	"vnd.ms-word.template.macroEnabled.12": "dotm",
	"vnd.ms-excel": "xls",
	"vnd.ms-excel": "xlt",
	"vnd.ms-excel": "xla",
	"vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
	"vnd.openxmlformats-officedocument.spreadsheetml.template": "xltx",
	"vnd.ms-excel.sheet.macroEnabled.12": "xlsm",
	"vnd.ms-excel.template.macroEnabled.12": "xltm",
	"vnd.ms-excel.addin.macroEnabled.12": "xlam",
	"vnd.ms-excel.sheet.binary.macroEnabled.12": "xlsb",
	"vnd.ms-powerpoint": "ppt",
	"vnd.ms-powerpoint": "pot",
	"vnd.ms-powerpoint": "pps",
	"vnd.ms-powerpoint": "ppa",
	"vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
	"vnd.openxmlformats-officedocument.presentationml.template": "potx",
	"vnd.openxmlformats-officedocument.presentationml.slideshow": "ppsx",
	"vnd.ms-powerpoint.addin.macroEnabled.12": "ppam",
	"vnd.ms-powerpoint.presentation.macroEnabled.12": "pptm",
	"vnd.ms-powerpoint.template.macroEnabled.12": "potm",
	"vnd.ms-powerpoint.slideshow.macroEnabled.12": "ppsm",
	"vnd.ms-access": "mdb"
}

export { formatBytes, officeTypes };