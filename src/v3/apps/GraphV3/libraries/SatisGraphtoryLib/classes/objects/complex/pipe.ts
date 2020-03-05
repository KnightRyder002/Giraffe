import gqlType from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/decorators/gqlType';
import GqlObject from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/classes/objects/base/gqlObject';
import dataField from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/decorators/dataField';
import { setDataFields } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/decorators/dataFieldUtils/utils';

import Protoable from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/classes/objects/interfaces/protoable';
import generateEnum from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/decorators/generateEnum';
import stripClassName from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/decorators/stripClassName';

@generateEnum('name')
class Pipe extends GqlObject implements Protoable {
  @dataField('ClassName')
  @gqlType('String!')
  @stripClassName
  public name: string = '';
  @gqlType('String!')
  @dataField('mDisplayName')
  public displayName: string = '';
  @gqlType('String!')
  @dataField('mDescription')
  public description: string = '';
  @gqlType('Float!')
  @dataField('mFlowLimit')
  public flowLimit: number = 0;

  constructor(props: any) {
    super();
    setDataFields(this, props);
  }
}

export default Pipe;
