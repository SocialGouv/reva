const fs = require("fs");

const uncrawlableRobotsTxt = `User-agent: *\nDisallow: /`;

const generateRobotsTxt = () => {
  // Create a non-crawlable robots.txt in non-production environments

  const generateUncrawlableRobotsTxt =
    process.env.NEXT_PUBLIC_GENERATE_UNCRAWLABLE_ROBOTS_TXT === "true";

  if (generateUncrawlableRobotsTxt) {
    fs.writeFileSync("public/robots.txt", uncrawlableRobotsTxt);
    console.log("Generated a  non - crawlable robots.txt");
  } else {
    console.log("No robots.txt generated");
  }
};

generateRobotsTxt();
