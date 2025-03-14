// import Image from 'next/image';
import Input from './Input';

export default function Background() {
    return (
        <div style={{ 
            // position: 'absolute',
            overflow: 'hidden', zIndex: '10',
            top: '0%', right: '0%',
            width: '96%', height: '100px',
            // border: '1px black solid',
            display: 'flex', alignItems: 'end', justifyContent: 'end',
            padding: '0px 20px'
        }}>
            {/* <Image 
                src="/htdc.png" 
                alt="Example image" 
                width={800} 
                height={400}
                style={{ 
                    opacity: '20%'
                }} 
            /> */}
            <div style={{
                        color: 'black', fontSize: '10px',
                        // border: 'solid 1px red',
                        display: 'flex', flexDirection: 'column',                        
            }}>
                <span>if you want to overcome the whole world, overcome yourself</span>
                <div style={{ 
                        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                        width: '540px'
                }}>
                    <span>xew.aes32s.zszez2.3eszdx.32ese3</span>
                    <span>howtodisappearcompletely?node-id=0-1&p=f&t=dGFQ0Pzoguj8HUDX-0</span>
                    <svg width="20" height="20" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M41.2592 202.534L138.222 247.703L195.241 167.961C195.241 167.961 166.402 235.239 197.038 260.909C227.673 286.579 307.963 262.415 307.963 262.415L212.797 310.192L266.704 391.44L169.741 346.27L112.722 426.012C112.722 426.012 141.561 358.735 110.925 333.065C80.2902 307.395 0 331.559 0 331.559L95.1658 283.781L41.2592 202.534Z" fill="black"/>
                        <path d="M600 363.775L522.834 296.987L600 230.198C600 230.198 529.91 270.952 492.389 252.8C454.869 234.649 461.944 163.41 461.944 163.41L431.499 252.8L323.888 230.198L401.053 296.987L323.888 363.775C323.888 363.775 393.978 323.021 431.499 341.173C469.019 359.325 461.944 430.564 461.944 430.564L492.389 341.173L600 363.775Z" fill="black"/>
                        <path d="M253.44 251.043L318.536 175.768L410.432 227.847C410.432 227.847 350.363 177.086 365.181 142.972C379.999 108.858 464.954 102.326 464.954 102.326L354.607 92.7251L362.485 0L297.389 75.2746L205.494 23.1954C205.494 23.1954 265.562 73.9572 250.744 108.071C235.926 142.185 150.971 148.717 150.971 148.717L261.318 158.318L253.44 251.043Z" fill="black"/>
                        <path d="M158.163 422.766L247.997 477.312L185.844 554.314C185.844 554.314 246.424 503.981 287.136 516.397C327.848 528.814 335.644 600 335.644 600L347.102 507.537L457.762 514.138L367.928 459.592L430.08 382.591C430.08 382.591 369.5 432.924 328.788 420.507C288.076 408.091 280.28 336.904 280.28 336.904L268.823 429.367L158.163 422.766Z" fill="black"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}
