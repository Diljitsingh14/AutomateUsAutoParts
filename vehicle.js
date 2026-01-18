import axios from "axios";
import { configDotenv } from "dotenv";
import { ENDPOINTS_URI } from "./src/constance.js";
import VehicleDB from "./src/db/serviceLine.js";

configDotenv();

const needs = {
  makes: [38], //[18, 1, 27, 31, 43, 128], //[19, 50, 45, 25, 105, 20, 32, 18, 1, 27, 31, 43, 128],
  years:  [2007,2008,2009, 2010,2011, 2012,2013,2014, 2015,2016 ,2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,2025],
  types: [
    {
      Next: "/VehicleInfo?type=1",
      Id: 1,
      Value: "Car",
    },
    {
      Next: "/VehicleInfo?type=3",
      Id: 3,
      Value: "Truck",
    },
    {
      Next: "/VehicleInfo?type=4",
      Id: 4,
      Value: "Van",
    },
    {
      Next: "/VehicleInfo?type=5",
      Id: 5,
      Value: "SUV",
    },
    {
      Next: "/VehicleInfo?type=50",
      Id: 50,
      Value: "Generic Vehicle",
    },
  ],
};

export const all_makes = [
  {
    Next: "/VehicleInfo?type=1&year=2015&make=1",
    Id: 1,
    Value: "Acura",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=2",
    Id: 2,
    Value: "Alfa Romeo",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=98",
    Id: 98,
    Value: "Aston Martin",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=4",
    Id: 4,
    Value: "Audi",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=99",
    Id: 99,
    Value: "Bentley",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=5",
    Id: 5,
    Value: "BMW",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=6",
    Id: 6,
    Value: "Buick",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=7",
    Id: 7,
    Value: "Cadillac",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=9",
    Id: 9,
    Value: "Chevrolet",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=10",
    Id: 10,
    Value: "Chrysler",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=12",
    Id: 12,
    Value: "Dodge",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=100",
    Id: 100,
    Value: "Ferrari",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=14",
    Id: 14,
    Value: "Fiat",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=15",
    Id: 15,
    Value: "Ford",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=128",
    Id: 128,
    Value: "Genesis",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=18",
    Id: 18,
    Value: "Honda",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=19",
    Id: 19,
    Value: "Hyundai",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=20",
    Id: 20,
    Value: "Infiniti",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=22",
    Id: 22,
    Value: "Jaguar",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=50",
    Id: 50,
    Value: "Kia",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=101",
    Id: 101,
    Value: "Lamborghini",
  },
  {
    Next: "/VehicleInfo?type=5&year=2020&make=38",
    Id: 38,
    Value: "Land Rover",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=25",
    Id: 25,
    Value: "Lexus",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=26",
    Id: 26,
    Value: "Lincoln",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=97",
    Id: 97,
    Value: "Maserati",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=27",
    Id: 27,
    Value: "Mazda",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=129",
    Id: 129,
    Value: "McLaren",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=28",
    Id: 28,
    Value: "Mercedes-Benz",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=95",
    Id: 95,
    Value: "MINI",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=31",
    Id: 31,
    Value: "Mitsubishi",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=32",
    Id: 32,
    Value: "Nissan",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=37",
    Id: 37,
    Value: "Porsche",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=103",
    Id: 103,
    Value: "Rolls Royce",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=105",
    Id: 105,
    Value: "Scion",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=111",
    Id: 111,
    Value: "Smart",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=43",
    Id: 43,
    Value: "Subaru",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=127",
    Id: 127,
    Value: "Tesla",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=45",
    Id: 45,
    Value: "Toyota",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=47",
    Id: 47,
    Value: "Volkswagen",
  },
  {
    Next: "/VehicleInfo?type=1&year=2015&make=48",
    Id: 48,
    Value: "Volvo",
  },
];

const vehicleTypes = [
  {
    Next: "/VehicleInfo?type=1",
    Id: 1,
    Value: "Car",
  },
  {
    Next: "/VehicleInfo?type=3",
    Id: 3,
    Value: "Truck",
  },
  {
    Next: "/VehicleInfo?type=4",
    Id: 4,
    Value: "Van",
  },
  {
    Next: "/VehicleInfo?type=5",
    Id: 5,
    Value: "SUV",
  },
  {
    Next: "/VehicleInfo?type=50",
    Id: 50,
    Value: "Generic Vehicle",
  },
];

const all_model = {
  18: [
    {
      Next: "/VehicleInfo?type=1&year=2015&make=18&model=78",
      Id: 78,
      Value: "Accord",
    },
    {
      Next: "/VehicleInfo?type=1&year=2015&make=18&model=2647",
      Id: 2647,
      Value: "Accord Hybrid",
    },
    {
      Next: "/VehicleInfo?type=1&year=2015&make=18&model=158",
      Id: 158,
      Value: "Civic",
    },
    {
      Next: "/VehicleInfo?type=1&year=2015&make=18&model=2511",
      Id: 2511,
      Value: "Crosstour",
    },
    {
      Next: "/VehicleInfo?type=1&year=2015&make=18&model=2457",
      Id: 2457,
      Value: "CR-Z",
    },
    {
      Next: "/VehicleInfo?type=1&year=2015&make=18&model=1624",
      Id: 1624,
      Value: "Fit",
    },
  ],
};

class Vehicle {
  constructor(model = null) {
    this.steps = [
      "Years",
      "Makes",
      "Models",
      "SubModels",
      "BodyStyles",
      "Engines",
      "Transmissions",
      "DriveTrains",
    ];

    this.vehicles_res = [];
    this.res_data = [];
    this.vehicleDB = new VehicleDB();
    this.specificModelOnly = model;
  }

  init = async () => {
    await this.vehicleDB.connectToDB();
  };

  async seeder(carMake = false) {
    await this.init();
    let makes_to_fetch = [...needs.makes];
    if (carMake) makes_to_fetch = [carMake];

    for (const type of needs.types) {
      for (const year of needs.years) {
        for (const make of makes_to_fetch) {
          let res;
          if (this.specificModelOnly) {
            res = [this.specificModelOnly];
          } else {
            let url = `/VehicleInfo?type=${type.Id}&year=${year}&make=${make}`;
            res = (res = await this.fetchServiceNo(url))[this.steps[2]];
          }
          for (const model of res) {
            let nextUrl = model.Next;
            if (this.specificModelOnly) {
              nextUrl = `/VehicleInfo?type=${type.Id}&year=${year}&make=${make}&model=${model.Id}`;
            }
            const res = await this.fetchServiceNo(nextUrl);
            for (const subModel of res[this.steps[3]]) {
              const res = await this.fetchServiceNo(subModel.Next);
              for (const bodyType of res[this.steps[4]]) {
                const res = await this.fetchServiceNo(bodyType.Next);
                for (const engine of res[this.steps[5]]) {
                  const res = await this.fetchServiceNo(engine.Next);
                  for (const transmission of res[this.steps[6]]) {
                    const res = await this.fetchServiceNo(transmission.Next);
                    for (const drivetrain of res[this.steps[7]]) {
                      console.log(
                        `Fetching ${make} ${type.Value} ${year} ${model.Value} ${subModel.Value} ${engine.Value} ${transmission.Value}`
                      );
                      const res = await this.fetchServiceNo(drivetrain.Next);
                      this.vehicles_res.push(res["Vehicle"]);
                      if (res["Vehicle"])
                        await this.vehicleDB.insertData(res["Vehicle"]);
                      this.res_data.push(res);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  fetchServiceNo = async (appended_url) => {
    // const url = `https://estimate.mymitchell.com/VehicleIdentificationService/8.0/VehicleInfo?type=1&year=2017&make=19&model=214&subModel=241&bodystyle=114&engine=88&transmission=19&drivetrain=6`;
    const url =
      `https://estimate.mymitchell.com/VehicleIdentificationService/8.0` +
      appended_url;

    const idToken = process.env.ID_TOKEN;

    try {
      const response = await axios.get(url, {
        headers: {
          Id_token: `${idToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching part details:",
        error.response?.data || error.message
      );
      throw error;
    }
  };
}

// Get Service line(service Bar code number) and saving to db
async function seedServiceBarCodes() {
  // const new_vehicle = new Vehicle({
  //   Next: "/VehicleInfo?type=1&year=2017&make=45&model=1400",
  //   Id: 1400,
  //   Value: "Yaris",
  // });
  const new_vehicle = new Vehicle();

  await new_vehicle.seeder();
  await new_vehicle.vehicleDB.closeConnection();
  // console.log("####ALL RES ###", new_vehicle.res_data);
  // console.log("####VEHICLE###", new_vehicle.vehicles_res);
}

// seedServiceBarCodes();

// async function fetchAllBefore2017() {
//   const new_vehicle = new Vehicle();
//   await new_vehicle.seeder();
//   await new_vehicle.vehicleDB.closeConnection();
// }
// fetchAllBefore2017();

async function fetchGV60() {
  const new_vehicle = new Vehicle();
  await new_vehicle.seeder();
  await new_vehicle.vehicleDB.closeConnection();
}

export default Vehicle;
