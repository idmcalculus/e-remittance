export const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "RCCG E-remittance API",
			version: "1.0.0",
			description: "RCCG Remittance Application V2",
			license: {
				name: "RCCG",
				url: "https://www.rccg.org",
			}
		},
		servers: [
			{
				url: "http://svr4242ww2.rccgportal.org:16627",
				description: "Staging server"
			},
			{
				url: "http://localhost:3100",
				description: "Local server"
			},
		],
	},
	apis: ['./routes/*.js'],
}; 