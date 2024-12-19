# JavaScript에서의 동시성 문제(Race Condition)

## 개요
JavaScript에서의 동시성 문제는 비동기 프로그래밍 환경에서 자주 발생하는 중요한 개념입니다:
- 여러 비동기 작업이 공유 자원에 동시 접근할 때 발생
- 작업의 실행 순서가 예측 불가능하여 결과가 비결정적
- JavaScript의 비동기 특성으로 인한 예상치 못한 동작 발생

### 예시: 카운터 증가 문제
```javascript
let counter = 0;

function incrementCounter() {
    setTimeout(() => {
        const currentValue = counter;
        counter = currentValue + 1;
        console.log(`Counter: ${counter}`);
    }, Math.random() * 100);
}

// 여러 번 동시에 호출
for (let i = 0; i < 5; i++) {
    incrementCounter();
}
```

## 동시성 문제가 발생하는 이유

### 1. 이벤트 루프와 비동기 실행
- JavaScript는 단일 스레드 모델 사용
- 이벤트 루프를 통한 비동기 작업 처리
- 작업 완료 순서가 호출 순서와 다를 수 있음

### 2. 클로저와 비동기 콜백
```javascript
for (var i = 0; i < 5; i++) {
    setTimeout(() => console.log(i), 100);
}
```

### 3. Promise와 비동기 작업 순서
```javascript
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);

promise1.then(value => console.log(value));
promise2.then(value => console.log(value));
```

## 해결 방법

### 1. async/await 사용
```javascript
async function incrementCounter() {
    const currentValue = await getCurrentValue();
    const newValue = currentValue + 1;
    await updateValue(newValue);
    console.log(`Counter: ${newValue}`);
}
```

### 2. Promise.all() 활용
```javascript
const promises = [fetchData1(), fetchData2(), fetchData3()];
Promise.all(promises)
    .then(results => {
        // 모든 데이터 처리
    })
    .catch(error => {
        // 에러 처리
    });
```

### 3. 세마포어 패턴
```javascript
class Semaphore {
    constructor(max) {
        this.max = max;
        this.count = 0;
        this.queue = [];
    }

    async acquire() {
        if (this.count < this.max) {
            this.count++;
            return Promise.resolve();
        }
        return new Promise(resolve => this.queue.push(resolve));
    }

    release() {
        this.count--;
        if (this.queue.length > 0) {
            this.count++;
            const next = this.queue.shift();
            next();
        }
    }
}
```

### 4. 락 메커니즘
```javascript
class Lock {
    constructor() {
        this._locked = false;
        this._waiting = [];
    }

    async acquire() {
        return new Promise(resolve => {
            if (!this._locked) {
                this._locked = true;
                resolve();
            } else {
                this._waiting.push(resolve);
            }
        });
    }

    release() {
        if (this._waiting.length > 0) {
            const next = this._waiting.shift();
            next();
        } else {
            this._locked = false;
        }
    }
}
```

### 5. async-mutex를 사용한 동시성 제어

### async-mutex의 원리
async-mutex는 JavaScript에서 동시성 제어를 위한 라이브러리로, 다음과 같은 원리로 동작합니다:

1. 뮤텍스 생성: 공유 자원에 대한 접근을 제어하기 위한 뮤텍스 객체 생성
2. 락 획득: 임계 영역 진입 전 mutex.acquire()를 호출하여 락 획득
3. 임계 영역 실행: 락을 획득한 후에만 공유 자원에 대한 작업 수행
4. 락 해제: 작업 완료 후 release()를 호출하여 락 해제

### 예시: async-mutex를 사용한 포인트 차감
```javascript
const { Mutex } = require('async-mutex');

class PointService {
    constructor() {
        this.mutex = new Mutex();
        this.userPoints = new Map();
    }

    async usePoint(userId: number, amount: number) {
        // 락 획득
        const release = await this.mutex.acquire();
        try {
            // 임계 영역 시작
            const currentPoint = await this.getUserPoint(userId);
            if (currentPoint < amount) {
                throw new Error('포인트 부족');
            }
            
            // 포인트 차감 처리
            const newPoint = currentPoint - amount;
            await this.updateUserPoint(userId, newPoint);
            // 임계 영역 종료
            
            return newPoint;
        } finally {
            // 락 해제 (에러가 발생하더라도 반드시 실행)
            release();
        }
    }
}
```

### async-mutex의 장점
1. **데드락 방지**: finally 블록에서 항상 락을 해제하므로 데드락 위험이 낮음
2. **간단한 사용법**: Promise 기반의 직관적인 API 제공
3. **타입 안전성**: TypeScript 지원으로 타입 안전성 보장
4. **성능**: 효율적인 락 관리로 오버헤드 최소화

### 실제 사용 사례
```javascript
// 포인트 차감 요청 처리
app.post('/points/use', async (req, res) => {
    const { userId, amount } = req.body;
    
    try {
        const newPoint = await pointService.usePoint(userId, amount);
        res.json({ success: true, remainingPoint: newPoint });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// 동시에 여러 요청이 들어와도 안전하게 처리
Promise.all([
    pointService.usePoint(1, 100),
    pointService.usePoint(1, 200),
    pointService.usePoint(1, 300)
]).then(results => {
    console.log('모든 포인트 차감 완료:', results);
});
```

## 테스트 방법
1. 비동기 테스트 프레임워크 사용 (Jest, Mocha)
2. 타이밍 조작 (setTimeout, setImmediate)
3. Promise 기반 테스트
4. 동시성 시뮬레이션

### 테스트 예시 (Jest)
```javascript
test('Resource increments correctly under concurrent access', async () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(incrementResource());
    }
    await Promise.all(promises);
    expect(getSharedResource()).toBe(5);
});
```

## 참고 자료
- [JavaScript 이벤트 루프](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [Node.js 비동기 프로그래밍](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)
- [JavaScript Promise와 async/await](https://javascript.info/async-await)
- [Jest 비동기 테스팅](https://jestjs.io/docs/asynchronous)