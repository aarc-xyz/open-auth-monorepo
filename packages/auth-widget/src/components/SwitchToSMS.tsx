import { Switch } from "antd"
import { Dispatch, SetStateAction } from "react"
import { AarcAuthWidgetConfig } from './types'

const SwitchToSMS = ({ isEmail, setIsEmail, config }: {
    isEmail: boolean,
    setIsEmail: Dispatch<SetStateAction<boolean>>,
    config: AarcAuthWidgetConfig
}) => {
    return (
        <div className={config.appearance.darkMode ? "flex h-[40px] mt-4 rounded-md bg-[#3E3E3E] py-[10px] px-[14px] text-[14px] font-semibold justify-between" : "flex h-[40px] mt-4 rounded-md bg-[#F6F6F6] py-[10px] px-[14px] text-[14px] font-semibold justify-between"}>
            <div className={config.appearance.darkMode ? " text-white" : "text-[#4E4E4E]"}>Switch to SMS</div>
            <Switch checked={!isEmail} onChange={() => setIsEmail(!isEmail)} />
        </div>
    )
}

export default SwitchToSMS