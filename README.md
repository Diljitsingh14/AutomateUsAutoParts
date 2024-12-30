# AutomateUsAutoParts

fx:
builder() : Mapping Parts Info from service Line response ie: extracts parts details and mapping.

getPartByServiceLine(partnumber, serviceLine): extract part detail by part number from service Line Response.

getPartsByServiceLine(vehicle, saveToDB = false) : Get Service Line Response from Vehicle detail(full res service line) and save to DB (parameterized).

savePartsToDB(preprocessedParts, vehicleInfo) : save parts to DB individual fx to save parts.

### DB Select fx:

getServiceLinesByMake(
makeId,
year = "",
type = "",
from = "",
to = "",
not = "",
model = ""
)
getServiceLinesByYear(year, op = "eq")
getServiceLineResponse(id, makeId)
getPartByPartNumber(partNumber)

### Helper fx:

getUniqueServiceLine()
hasNulls()
convertToExcel()
