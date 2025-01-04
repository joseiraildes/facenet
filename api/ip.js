async function Ip(){
  try {
    const ip = await fetch("https://api64.ipify.org?format=json")
    const data = await ip.json();

    return data
  } catch {
    console.error("Failed to fetch IP address");
    return null;
  }
}

module.exports = Ip