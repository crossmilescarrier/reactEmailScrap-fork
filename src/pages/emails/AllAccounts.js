import AuthLayout from '../../layout/AuthLayout'
import AccountItem from './AccountItem'

export default function AllAccounts() {
  return (
      <AuthLayout>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='heading '>All Emails Accounts</h1>
        </div>

        <div className='email-list'>
            <AccountItem />
            <AccountItem />
            <AccountItem />
            <AccountItem />
            <AccountItem />
            <AccountItem />
            <AccountItem />
        </div>

      </AuthLayout>
  )
}
