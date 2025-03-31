const fs=require("fs");const p="/Users/naruto_uzumaki/Desktop/TamkeenAI/Tamkeen-Ai/TamkeenAI_CareerSystem/frontend/src/pages/ResumePage.jsx";let c=fs.readFileSync(p,"utf8");c=c.replace(/\s*return renderResumeContent\(\);(\s*)\};(\s*)export default ResumePage;?;?/m,"$1  return renderResumeContent();
};

export default ResumePage;");fs.writeFileSync(p,c);
