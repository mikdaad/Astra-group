
import { TextShimmer } from "../../components/general/loadingcomp";

export default function LoadingFile() {
  return (
    <div className="text-center   h-full mt-[60%] lg:mt-[20%]">
       
    <TextShimmer className='font-glancyr text-2xl' duration={1.5}>
      A&nbsp;S&nbsp;T&nbsp;R&nbsp;A 
       </TextShimmer>
    </div>
  );
}
