-- file : config.lua
local module = {}

module.SSID = {}
module.SSID["Stormageddon"]= "WateryWater856"

module.HOST = "192.168.1.252"
module.PORT = 1883
module.ID = node.chipid()

return module
