using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class almacenar
{
    public int id_inventario { get; set; }

    public int id_producto { get; set; }

    public int stockactual { get; set; }

    public virtual inventario id_inventarioNavigation { get; set; } = null!;

    public virtual producto id_productoNavigation { get; set; } = null!;
}
