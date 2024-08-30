import { Button, Form, Input, Select } from 'antd'

export default function Deposit({ step, setStep }: any) {
    return (

        <Form layout='vertical' disabled={step === 'deposit-confirm' ? true : false} className='flex flex-col gap-[14px]'>
            <Form.Item label="Network">
                <Select
                    className='h-[44px] border-[#989898] border-[1px] rounded-md'
                    showSearch
                    variant="borderless"
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    options={[
                        {
                            value: '1',
                            label: <div className='flex gap-2 h-[44px] items-center'>
                                <img height={24} width={24}

                                    src="https://s3-alpha-sig.figma.com/img/6b96/e07e/ea8f224aa4db7ce6ac4494a9d615af59?Expires=1715558400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=llODevBjjbPhx9PrRImCAK3mQkLnc~pjgScEwZEl~B9hfIVR3BLmdBH-QEieSQUv12PoiyyIyaiLZTJkfYVQyIgOKsnocvfpgTl2oi-PiZQ0nZfvv~rJ-HeMDfyN6Wd3lmBbNdUbI7SstvIvZN7TaWsmAULi5WSV1Mg9iTQ1UbMgnjImHvmr02m7UJaxhC69mZlc5laSBjPjEFFAphiBoSI5FuUJMpOp-rwqKw4rDYUPhFDNtqxr8oswp1AXSLa2ypK~-jRaQAmLvYT8K6-L825T8W9btjjlOOCuGcH7xd-JqDOTThIzF92iK1eBUbjgnOZ8Dhc4RSd2-G8Bbt0Qgg__" />
                                <p>Polygon</p>
                            </div>
                        },

                    ]}
                />

            </Form.Item>
            <Form.Item label="Token">
                <Select
                    className='h-[44px] border-[#989898] border-[1px] rounded-md'
                    showSearch
                    variant="borderless"
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    options={[
                        {
                            value: '1',
                            label: <div className='flex gap-2 h-[44px] items-center'>
                                <img height={24} width={24}

                                    src="https://s3-alpha-sig.figma.com/img/6b96/e07e/ea8f224aa4db7ce6ac4494a9d615af59?Expires=1715558400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=llODevBjjbPhx9PrRImCAK3mQkLnc~pjgScEwZEl~B9hfIVR3BLmdBH-QEieSQUv12PoiyyIyaiLZTJkfYVQyIgOKsnocvfpgTl2oi-PiZQ0nZfvv~rJ-HeMDfyN6Wd3lmBbNdUbI7SstvIvZN7TaWsmAULi5WSV1Mg9iTQ1UbMgnjImHvmr02m7UJaxhC69mZlc5laSBjPjEFFAphiBoSI5FuUJMpOp-rwqKw4rDYUPhFDNtqxr8oswp1AXSLa2ypK~-jRaQAmLvYT8K6-L825T8W9btjjlOOCuGcH7xd-JqDOTThIzF92iK1eBUbjgnOZ8Dhc4RSd2-G8Bbt0Qgg__" />
                                <p>Polygon</p>
                            </div>
                        },

                    ]}
                />

            </Form.Item>
            <Form.Item label='Receiver’s address'>
                <Input className='h-[44px] border-[#989898] border-[1px]' placeholder='0x7ef61A717a5A088Ccc5d52c62e23a64d26CEC533' />
            </Form.Item>
            {step == 'deposit-confirm' ? <div className='flex gap-4'>
                <Button onClick={() => setStep('deposit')} className='h-[44px] w-[140px]' disabled={false}>Back</Button>
                <Button className='h-[44px] w-full' type='primary' disabled={false}>Confirm</Button>
            </div> :
                <div className='flex gap-4'>
                    <Button onClick={() => setStep('home')} className='h-[44px] w-[140px]'>Cancel</Button>
                    <Button onClick={() => setStep('deposit-confirm')} className='h-[44px] w-full' type='primary'>Next</Button>
                </div>}
        </Form>
    )
}