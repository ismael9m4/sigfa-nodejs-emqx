
const mysql = require("mysql");
const mqtt = require("mqtt");
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "38655155Iam",
	database: "sistema_fugas"
});

con.connect(function (err){
	if(err) throw err;
	console.log("Conexion a MySQL OK");
});

var options = {
	port:1883,
	clientId:"MQTT_Node",
	username:"isma22",
	password:"38655155iam",
	keepalive:60,
};

var client = mqtt.connect("mqtt://192.168.10.112",options);
client.on("connect",function(){
	console.log("Conexion a MQTT");
	client.subscribe("+/#",function(err){
		console.log("Subscripcion exitosa a todos los topicos");
	})
});

client.on("message",function(topic,message){
	console.log("Topico:"+topic+ "\nMensaje: "+message.toString());
	var topic_splitter = topic.split("/");
	var device_id = topic_splitter[0];
	var topico = topic_splitter[1];

	switch (topico) {
		case "valores":
			var query="SELECT fk_sensor FROM readings WHERE fk_sensor = '"+device_id+"'";
			con.query(query,function(err,result,fields){
				console.log(result);
				if(err) throw err;
				var mensaje=message.toString();
				var msg = mensaje.split(",");
				var salida=msg[0];
				var serie=msg[1];
				var deviceid=msg[2];
				//var date=msg[2];
				//var unit=msg[3];
				var fecha= new Date();
				var fechaHoy= fecha.toISOString().substring(0,10);
				var hora_actual = fecha.getHours();
				var removed=0;
				var anio=fecha.getFullYear();
				var query1 = "INSERT INTO `sistema_fugas`.`readings` (`year`, `hour`, `value`, `unit`, `details`, `fk_sensor`, `removed`) VALUES ("+anio+","+hora_actual+","+salida+",'L/min',"+serie+","+deviceid+","+removed+")";
				con.query(query1,function(err,result,fields){
						if(err) throw err;
						console.log("Registro guardado en la BBDD");
				})
			})
			break;
		default:
			console.log("Otro topico");
			break;
	}
});
