// ADD TO src/main.js or App.jsx - REAL DATA SAVING
const appState = JSON.parse(localStorage.getItem("profitManager")) || {
  ledger: [], pepperstone: {balance:0,transactions:[],mode:"goal"}, 
  tradify: {balance:0,transactions:[]}, allocations:{}, goals:[], tax:{year:2026,total:0}
};

// AUTO-SAVE every 10s
setInterval(() => localStorage.setItem("profitManager", JSON.stringify(appState)), 10000);

// EXPORT button
window.exportData = () => {
  const blob = new Blob([JSON.stringify(appState,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="profit-backup.json"; a.click();
};
