import * as Util from '@/utils/common'

const statusColor = {
  PENDING: {
    color: 'text-indigo-600'
  },
  SUCCESS: {
    color: 'text-green-600'
  },
  REJECT: {
    color: 'text-red-600'
  }
}

//  owenr -> receriver -> [received items, lost items]
const transactionMap = {
  clan: {
    clan: ['fuel', 'money'],
    market: ['stock', 'money'],
    planet: ['planets', '']
  },
  market: {
    clan: ['money', 'stock']
  },
  planet: {
    clan: ['', 'fuel']
  },
  user: {
    clan: ['money', '']
  }
}

const resolveTransactionItems = (data) => {
  const bill = transactionMap[data.owner.type][data.receiver.type]

  const receivedItem = data.item[bill[0]] || 'nothing'
  const lostItem = data.item[bill[1]] || 'nothing'

  // Resolve stock or planet
  if ((typeof receivedItem === 'object') || (typeof lostItem === 'object')) {
    // Stock resolver
    if (receivedItem && receivedItem.symbol) {
      return {
        type: 'stock',
        received: data.item.stock.amount.toString().concat(' ', receivedItem.symbol),
        cost: receivedItem.rate * receivedItem.amount
      }
    } else if (lostItem && lostItem.symbol) {
      return {
        type: 'stock',
        received: lostItem.rate * lostItem.amount,
        cost: data.item.stock.amount.toString().concat(' ', lostItem.symbol)
      }
    }
  }

  
  if (lostItem == 'nothing' && data.item.money) {
    return {
      type: 'money',
      received: receivedItem
    }
  }
  
  if (data.item.fuel && receivedItem != 'nothing')
  return {
    type: 'fuel',
    received: data.item.fuel.toString().concat(' fuel'),
    cost: lostItem
  }

  if (lostItem == 'nothing' && receivedItem[0]) {
    return {
      type: 'planet',
      received: receivedItem
    }
  }

  // Planet resovler
    return {
      type: 'planet',
      cost: lostItem,
    }
}

export default function TransactionItem({ transaction }) {
  const item = resolveTransactionItems(transaction)
  const isStrike = transaction.status == 'REJECT' ? 'line-through' : ''
  return (
    <div className="flex flex-col justify-between backdrop-blur-3xl rounded-xl py-4 px-6 bg-white bg-opacity-40 filter mr-1">
      <div className="flex flex-row justify-between items-center">
        <div className="font-light text-sm lg:text-base text-gray-500">ID: {transaction._id}</div>
        <div className="text-right">Status: <span className={Util.concatClasses('font-medium', statusColor[transaction.status].color)}>{transaction.status}</span></div>
      </div>
      <div className="flex flex-row justify-between items-center">
        {(item.type != 'money' && transaction.owner.type == 'clan' && transaction.receiver.type != 'planet') &&
          <>
            <div className="font-bold text-lg text-indigo-900">
              <span className={isStrike}>
                Buy {item.received} for {item.cost} coin
              </span>
            </div>
          </>
        }
        {transaction.owner.type == 'market' &&
          <>
            <div className="font-bold text-lg text-indigo-900">
              <span className={isStrike}>
                Sell {item.cost} for {item.received} coin
              </span>
            </div>
          </>
        }
        {transaction.owner.type == 'planet' &&
          <>
            <div className="font-bold text-lg text-indigo-900">
              <span className={isStrike}>
                Go to planet {transaction.owner.id} for {item.cost} fuel
              </span>
            </div>
          </>
        }
        {transaction.receiver.type == 'planet' &&
          <>
            <div className="font-bold text-lg text-indigo-900">
              <span className={isStrike}>
                Received planet {transaction.receiver.id}
              </span>
            </div>
          </>
        }
        {item.type == 'money' &&
          <>
            <div className="font-bold text-lg text-indigo-900">
              <span className={isStrike}>
                Received {item.received} coin from {transaction.owner.id}
              </span>
            </div>
          </>
        }
        <div className="text-right font-normal text-gray-500 text-sm lg:text-base">Created at {transaction.createdAt.slice(0, 10)}</div>
      </div>
    </div>
  )
}