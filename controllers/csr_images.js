const fileUpload = (req, res, next) => {
	try {
		console.log(req.file);
		return res.status(200).json({
			status: 'success',
			message: 'File uploaded successfully'
		});
	} catch (error) {
		console.log(error)
	}
}
 
export { fileUpload };