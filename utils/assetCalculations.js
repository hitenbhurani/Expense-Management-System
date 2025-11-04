const calculateAssetMetrics = (asset) => {
  const totalValue = asset.quantity * asset.currentPrice;
  const totalInvestment = asset.quantity * asset.purchasePrice;
  const profitLoss = totalValue - totalInvestment;
  const profitLossPercentage = totalInvestment === 0 ? 0 : ((profitLoss / totalInvestment) * 100);

  return {
    totalValue,
    totalInvestment,
    profitLoss,
    profitLossPercentage
  };
};

module.exports = {
  calculateAssetMetrics
};