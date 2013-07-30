convert = (date) ->

	date = date.replace(/(Z|T)/, " ");

	hours = parseInt(date[11] + date[12])

	if hours > 12
		newHours = hours - 12
		date.substr(11) + " " + newHours + date.substr(17, 6) + "AM"
	else date + "PM"

module.exports = convert