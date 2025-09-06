import toLoveruAnkuru from '../assets/to_loveru_ankuru.png';
import mato_19 from '../assets/19.png';
import b5 from '../assets/b5.png';
import sakuka from '../assets/sakuka.png';

export function Home() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <img 
        src={sakuka} 
        alt="To Love-Ru Ankuru" 
className="max-w-full max-h-full object-contain"
      />
      {/* <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ホーム</h1>
          <p className="mt-4 text-gray-600">左タップ・右スワイプで次へ<br />右タップ・左スワイプで前へ</p>
        </div>
      </div>  
      */}
    </div>
  );
}