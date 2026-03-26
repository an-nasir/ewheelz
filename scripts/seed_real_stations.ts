import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

const stations = [
    {
        "city": "Lahore",
        "name": "aStop by Aramco",
        "address": "Opposite Expo Center Road, Johar Town",
        "phone": "03038544096",
        "map_link": "https://maps.app.goo.gl/MMfnPz34GmSDtnfi7"
    },
    {
        "city": "Lahore",
        "name": "Electric Vehicle Charging Station Girja Chowk",
        "address": "Girja Chowk, PSO",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/cFVivoDwWTAMFkXy7"
    },
    {
        "city": "Lahore",
        "name": "Electric Vehicle Charging Station",
        "address": "Packages Mall",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/wPdoaHaZrxqHqgXV9"
    },
    {
        "city": "Gujrat",
        "name": "Electric Vehicle Charging Station Gujrat",
        "address": "GT Road, Hardees near Gujrat",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/fhuN3yP85tAGcwMb7"
    },
    {
        "city": "Karachi",
        "name": "The Ocean Mall",
        "address": "Basement Parking",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/LaY6gFXZZy3Mnses9"
    },
    {
        "city": "Karachi",
        "name": "Electric Vehicle Charging Station – Askari IV",
        "address": "Gulistan e Johar, Rashid Minhas Rd, next to McDonalds",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/RMarLxFbb8wkAbE6A"
    },
    {
        "city": "Karachi",
        "name": "GO Petroleum – Libra Autos",
        "address": "Civil Lines",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/1A1LKwTPusd6TdEx7"
    },
    {
        "city": "Lahore",
        "name": "PSO – Bahria Filling Station",
        "address": "Sector B, Canal Bank Rd",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/e1VPbQHqy9YzPBH56"
    },
    {
        "city": "Lahore",
        "name": "Emporium Mall",
        "address": "AC charger in parking area",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/L42u2ouYDPFuXjLV7"
    },
    {
        "city": "Faisalabad",
        "name": "MG Lyallpur Motors",
        "address": "MG dealership, 7 kW AC charger",
        "phone": "03042222603",
        "map_link": "https://maps.app.goo.gl/HAFCeRSk71fZrwzT6"
    },
    {
        "city": "Faisalabad",
        "name": "HAVAL DOWNTOWN MOTORS (Faisalabad)",
        "address": "22 kW AC charging, Allows charging after 6 PM when the service center is closed.",
        "phone": "03040969589",
        "map_link": "https://maps.app.goo.gl/GcV49pGDR8RJZd9P7"
    },
    {
        "city": "Multan",
        "name": "BMW Destination Charging Station",
        "address": "Opposite DHA, 22 kW AC charger",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/AgqeUCpiu9oYuwak6"
    },
    {
        "city": "Gujranwala",
        "name": "Diamond Citizen Filling Station (HASCOL Petrol Pump)",
        "address": "22 kW AC charger",
        "phone": "03008511823",
        "map_link": "https://maps.app.goo.gl/a5UBzJTFpdRHfTno7"
    },
    {
        "city": "Multan",
        "name": "Asad Autos Multan",
        "address": "BYD 7 kW AC charger available between 10am-10pm. Friday is off",
        "phone": "03211110791",
        "map_link": "https://maps.app.goo.gl/2YV9b5EAidiccGXf6"
    },
    {
        "city": "Pindi Bhattian",
        "name": "Electric Vehicle Charging Station – Pindi Bhattian",
        "address": "",
        "phone": "03237706746, 03255995219",
        "map_link": "https://maps.app.goo.gl/nXbnaAaF9EkQAysU9"
    },
    {
        "city": "Lahore",
        "name": "Malik Enterprises- Total Petrol Station",
        "address": "Adjacent to Rangers HQ",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/5seKGV5yvfcoTTxA6"
    },
    {
        "city": "Lahore",
        "name": "Total Wash Iqbal Filling Station",
        "address": "MM Alam Rd",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/yEbKhPpavu5KuGoM7"
    },
    {
        "city": "Karachi",
        "name": "PSO Petrol Pump",
        "address": "DHA Phase 1, Rs 120/kWh",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/9GCuycaVv5XMeSLCA"
    },
    {
        "city": "Murree",
        "name": "EV Charger Murree",
        "address": "Musiari Link Rd, DC charger 80 kW with Rs 150/unit",
        "phone": "03429610163, 03136960207",
        "map_link": "https://maps.app.goo.gl/ohTMobr9wU5qCabH7"
    },
    {
        "city": "Gujrat",
        "name": "Haval | Baic Kaira Motors (Kaira Motors)",
        "address": "AC or DC charger",
        "phone": "03165930061",
        "map_link": "https://maps.app.goo.gl/vovyM2sgvmsYfviq8"
    },
    {
        "city": "Dharrabi",
        "name": "Malik Petroleum",
        "address": "11 km away from Balkasar Interchange on M-2 motorway, 7 kW AC charger",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/SJvLZKoqzRpS837A9"
    },
    {
        "city": "Faisalabad",
        "name": "Shell EV Charger",
        "address": "Near Lyallpur Galleria Mall",
        "phone": "03226001118, 03098880530, 03007669818",
        "map_link": "https://maps.app.goo.gl/8TF8CZ8i58Gbfi6M9"
    },
    {
        "city": "Karachi",
        "name": "Al-Madina CNG Station",
        "address": "M-9 Motorway, Nooriabad",
        "phone": "03082996962",
        "map_link": "https://maps.app.goo.gl/YifDHxzoqRarYab6A"
    },
    {
        "city": "Peshawar",
        "name": "Electric Vehicle Charging Station – PSO",
        "address": "Peshawar Cantt, Timing: 12PM to 9PM, Rs 120/unit till 6 PM, After 6 pm, Rs 140/unit",
        "phone": "0344-9060052",
        "map_link": "https://maps.app.goo.gl/CMbVKREy5EN3cWsH8"
    },
    {
        "city": "Karachi",
        "name": "ABB Charging Station",
        "address": "M-9 Motorway, Near Karachi",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/F9Pm1EHeBETwCrU76"
    },
    {
        "city": "Abdul Hakim",
        "name": "Electric Vehicle Charging Station – Abdul Hakim",
        "address": "M-4 Motorway, Kamran - 0300-6170021",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/sXVdHzrusjWdqSDF9"
    },
    {
        "city": "Lahore",
        "name": "A-Charge Charging Station",
        "address": "In Metro Thokar Niaz Baig",
        "phone": "03060651874, 03229648689",
        "map_link": "https://maps.app.goo.gl/kX1uLTz6LqEFULVW9"
    },
    {
        "city": "Gujranwala",
        "name": "Sunny Star CNG Station",
        "address": "110 per unit, 80kw charger, 1 gun ccs2 1 gun gbt",
        "phone": "03086462190, 03456531144",
        "map_link": "https://maps.app.goo.gl/8BLQjyqFpaX1cqip8"
    },
    {
        "city": "Bhera",
        "name": "M-2 Motorway Bhera New Charger",
        "address": "Near Bhera, 120 kW and 90 kW, Rs 120/unit",
        "phone": "03076559293",
        "map_link": "https://maps.app.goo.gl/m9ZrhwXFkNrLSG1d6"
    },
    {
        "city": "Nathia Gali",
        "name": "DoubleTree by Hilton Nathiagali",
        "address": "You can plug in your portable charger in the parking area",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/bByQGX51UENQwHBh7"
    },
    {
        "city": "Rawalpindi",
        "name": "Attock Fuel Pump",
        "address": "Near Old Airport Road, Rs 110/unit",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/tZwuc6StuVWR6tSj8"
    },
    {
        "city": "Karachi",
        "name": "Inverex EV Showroom",
        "address": "Main Shahra-e-Faisal, 60 kW DC charger, Rs 115/unit 10 AM to 6:30 PM",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/an6L6gMseHs2q5oPA"
    },
    {
        "city": "Karachi",
        "name": "EV Charging Station – Gulshan-e-Iqbal",
        "address": "Metro Safari Store, 1x DC 30 kW",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/F6Y12YzVEUtUHRTT7"
    },
    {
        "city": "Islamabad",
        "name": "Electric Vehicle Charging Station – Blue Area",
        "address": "Jinnah Avenue, Attock, Rs. 110/kWh",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/oFWJeyhcs6UPK19M6"
    },
    {
        "city": "Zahir Pir",
        "name": "Zahir Pir Filling Station South Bound",
        "address": "M-5 motorway",
        "phone": "03077490307",
        "map_link": "https://maps.app.goo.gl/ZjFYmrDD2FVQM6gY6"
    },
    {
        "city": "Bhera",
        "name": "Electric Vehicle Charging Station PSO Bhera",
        "address": "M-2 Motorway",
        "phone": "03008325438",
        "map_link": "https://maps.app.goo.gl/eWNf5JWF2zrWi8DT7"
    },
    {
        "city": "Hyderabad",
        "name": "PSO Fuel Station – Al-Falah Petroleum & CNG",
        "address": "Hyderabad Bypass road",
        "phone": "03012528839, 03480333014, 03083534697",
        "map_link": "https://maps.app.goo.gl/JUVUsTycwvXydhXs8"
    },
    {
        "city": "Lahore",
        "name": "PSO Petrol Pump – Ravi River Bridge",
        "address": "M-2 Motorway, PSO Magic River near Lahore",
        "phone": "03189009649, 03184570562, 03191630600",
        "map_link": "https://maps.app.goo.gl/VeaRuVUKyX4WVM9f8"
    },
    {
        "city": "Karachi",
        "name": "Shell Recharge Charging Station",
        "address": "DHA Phase 5, 1x DC 180 kW, 2x CCS2, Rs 105/unit",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/F9CP27Er1ka6uymG9"
    },
    {
        "city": "Islamabad",
        "name": "Electric Vehicle Charging Station",
        "address": "Blue Area, Jinnah Avenue, Attock Rs. 110/kWh",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/sMszGjmDa8JHRtGp7"
    },
    {
        "city": "Islamabad",
        "name": "PSO Marwat Filling Station",
        "address": "I-8 Markaz, 1x DC 60 kW, 2x CCS2, Rs 120/unit",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/fytRcZqxZuXxyo3dA"
    },
    {
        "city": "Rawalpindi",
        "name": "ZETA 1 Mall",
        "address": "Opposite to Giga Mall on GT road, DC 30 kW, Rs 130/unit",
        "phone": "03119258272",
        "map_link": "https://maps.app.goo.gl/Sr5gVftgqrrzfop79"
    },
    {
        "city": "Khariyan",
        "name": "Petropak CNG Station/ Hascol Petrol Pump/electric charging",
        "address": "Next to Mall of Kharian, GT road, 11 kW AC charger, 160 kW DC charger",
        "phone": "03215437810",
        "map_link": "https://maps.app.goo.gl/u9frtf7kxjaf8t3S6"
    },
    {
        "city": "Lahore",
        "name": "Go Green Avenue Charging Station Lahore",
        "address": "Main Boulevard Gulberg, AC charger",
        "phone": "03111164641",
        "map_link": "https://maps.app.goo.gl/1qhjqoDGq9hGvNfJ8"
    },
    {
        "city": "Islamabad",
        "name": "Islamabad Club – EV Charger",
        "address": "Islamabad Club, Murree Rd",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/GqpHabKpPHAPVSiV8"
    },
    {
        "city": "Islamabad",
        "name": "Electric Vehicle Charging Station I-10 Islamabad",
        "address": "I-10/3, Tesla Industries, Rs 125/unit",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/M48nMvfDGFuYZxuc9"
    },
    {
        "city": "Gojra",
        "name": "Hotel Centre Point EV Charger Jhang",
        "address": "M-4 motorway, outside Gojra Toll Plaza, 7 kW AC charger",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/e991xSvUNV8X252Y8"
    },
    {
        "city": "Islamabad",
        "name": "Elite Charging Station",
        "address": "G-6/4, Aramco, Rs 125/unit",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/qxavvXW38hT7iepv5"
    },
    {
        "city": "Nathia Gali",
        "name": "Hubco Charger Alpine Hotel Nathia Gali",
        "address": "Nathia Gali",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/JLvZmsQbAAs9gaQB9"
    },
    {
        "city": "Sialkot",
        "name": "Sialkot EV Charger",
        "address": "Karim Filling Station, Hascol AC 12 kW",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/xz6wEBHEZ6qv4SW68"
    },
    {
        "city": "Lahore",
        "name": "Dongfeng x Chawla Green Motors Gulberg",
        "address": "Main Boulevard Gulberg, DC charger",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/WxqE1mG28Phyxpud6"
    },
    {
        "city": "Islamabad",
        "name": "Haval Experience Islamabad Sale & Service Center",
        "address": "I-9/3, Rs 110/unit, 9 AM to 6 PM",
        "phone": "03114339489",
        "map_link": "https://maps.app.goo.gl/9hPxG748J852RTgB7"
    },
    {
        "city": "Moro",
        "name": "NEW ALI TRUCKING STATION PSO",
        "address": "N5 highway, 1x 60 kW DC charger, 2x CCS2 connectors, Rs 150/unit",
        "phone": "03085095443",
        "map_link": "https://maps.app.goo.gl/PwaLC9hPvG4LviPN6"
    },
    {
        "city": "Sukkur",
        "name": "PSO Bedal Petroleum Services Sukkur",
        "address": "N5 highway, 10 AM to 9 PM",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/QP9UUDvwb3vQ7Tfu6"
    },
    {
        "city": "Islamabad",
        "name": "Electric Vehicle Charging Station F-8 Islamabad",
        "address": "Centaurus Mall, in the basement parking, 60 kW, Rs 115/kWh during IESCO off-peak hours, Rs 125/kWh during peak hours",
        "phone": "03149106531",
        "map_link": "https://maps.app.goo.gl/1JtaMa14zXN18dcc8"
    },
    {
        "city": "Karachi",
        "name": "Dolmen Mall – Clifton EV Charger",
        "address": "Clifton, AC charger in parking arena",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/WKrj1id9VGnHg3fn6"
    },
    {
        "city": "Islamabad",
        "name": "PSO Marwat Filling Station",
        "address": "I-8 Markaz, 1x DC 60 kW, 2x CCS2, Rs 120/unit",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/4TdTniecAHrvZVP76"
    },
    {
        "city": "Karachi",
        "name": "Shell Recharge Charging Station",
        "address": "DHA Phase 5, 1x DC 180 kW, 2x CCS2, Rs 105/unit",
        "phone": "",
        "map_link": "https://maps.app.goo.gl/U1182yLd9XMjAvHj7"
    }
];

async function resolveCoords(mapLink: string) {
    try {
        const response = await axios.get(mapLink, { 
            maxRedirects: 5,
            timeout: 10000,
            validateStatus: () => true 
        });
        const finalUrl = response.request.res.responseUrl || mapLink;
        
        // Match @lat,lng
        const matchAt = finalUrl.match(/@([-.\d]+),([-.\d]+)/);
        if (matchAt) return { lat: parseFloat(matchAt[1]), lng: parseFloat(matchAt[2]) };
        
        // Match !3d...!4d...
        const matchBang = finalUrl.match(/!3d([-.\d]+)!4d([-.\d]+)/);
        if (matchBang) return { lat: parseFloat(matchBang[1]), lng: parseFloat(matchBang[2]) };
        
        return null;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log(`Starting seeding of ${stations.length} stations...`);
    
    for (const s of stations) {
        console.log(`Processing: ${s.name}...`);
        
        // Check if exists by name + city
        const existing = await prisma.chargingStation.findFirst({
            where: { name: s.name, city: s.city }
        });
        
        if (existing) {
            console.log(`Station ${s.name} already exists. Skipping.`);
            continue;
        }

        const coords = await resolveCoords(s.map_link);
        if (!coords) {
            console.warn(`Could not resolve coordinates for ${s.name}. Using default [0,0].`);
        }

        await prisma.chargingStation.create({
            data: {
                name: s.name,
                city: s.city,
                address: s.address,
                latitude: coords?.lat || 0,
                longitude: coords?.lng || 0,
                network: s.name.split(' ')[0], // Best guess for network
                isOnline: true,
                liveStatus: "OPERATIONAL",
                lastUpdated: new Date()
            }
        });
    }
    
    console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
