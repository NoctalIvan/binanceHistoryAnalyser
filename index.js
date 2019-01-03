// import file
const ExcelCSV = require('excelcsv')
const parser = new ExcelCSV(process.argv[2])
const tax = process.argv[3] ? 2 * process.argv[3] / 100 : 0
const csv = parser.init()
const lines = csv
    .split('\n')
    .slice(1)
    .map(line => line
        .split(',').map(value => value
            .slice(1, -1)
        )
    )
    .reverse()

// group by currency
const transactions = {}
lines.forEach(line => {
    if(!transactions[line[1]]) {
        transactions[line[1]] = [line]
    } else {
        transactions[line[1]].push(line)
    }
})

const result = {}
for(symbol in transactions) {
    const trans = transactions[symbol]

    // group consecutive transactions
    for(let i = 0; i < trans.length - 1; i ++) {
        if(trans[i][2] == trans[i+1][2]) {
            trans[i][0] = trans[i+1][0]
            trans[i][3] = 
                (trans[i][3] * trans[i][4] + 
                trans[i+1][3] * trans[i+1][4]) / (+trans[i][4] + +trans[i+1][4])
            trans[i][4] = +trans[i][4] + +trans[i+1][4]

            trans.splice(i+1, 1)
        }
    }

    // display results
    console.log(`\n-- ${symbol} --`)
    let lastBuy = undefined
    for(let i = 0; i < trans.length; i ++) {
        const line = trans[i]
        console.log(`${
            line[0]
        } : ${
            line[2] == 'BUY' ? 'BUY ' : 'SELL'
        } ${
            (+line[4]).toFixed(2)} @ ${(+line[3]).toFixed(8)
        } ${
            lastBuy && line[2] == 'SELL' ? '=> ' + (100 * (+line[3] / lastBuy - 1 - tax)).toFixed(2) + '%' : ''
        }`)

        if(line[2] == 'BUY') {
            lastBuy = +line[3]
        }
    }
}